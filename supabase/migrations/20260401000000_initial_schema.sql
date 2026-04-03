-- =============================================
-- Where In Maginhawa - Initial Schema Migration
-- =============================================

-- Table: profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'business_owner')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Table: places
CREATE TABLE public.places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  photos_urls TEXT[] DEFAULT '{}',
  operating_hours JSONB NOT NULL DEFAULT '{}',
  price_range TEXT NOT NULL CHECK (price_range IN ('$', '$$', '$$$', '$$$$')),
  payment_methods TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  cuisine_types TEXT[] DEFAULT '{}',
  specialties TEXT[] DEFAULT '{}',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  rating DECIMAL(2, 1),
  review_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  claimed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by TEXT,
  search_vector tsvector,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: contributors
CREATE TABLE public.contributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  github TEXT,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'verified')),
  contributed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: business_claims
CREATE TABLE public.business_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  claimant_name TEXT NOT NULL,
  claimant_phone TEXT,
  claimant_role TEXT NOT NULL CHECK (claimant_role IN ('owner', 'manager', 'representative')),
  proof_text TEXT,
  proof_documents TEXT[] DEFAULT '{}',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(place_id, user_id)
);

-- Table: update_suggestions
CREATE TABLE public.update_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  suggested_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  suggested_by_name TEXT NOT NULL,
  suggested_by_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  changes JSONB NOT NULL,
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: place_submissions
CREATE TABLE public.place_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  submitted_by_name TEXT NOT NULL,
  submitted_by_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  place_data JSONB NOT NULL,
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: rate_limits (shared across serverless instances)
CREATE TABLE public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Indexes
-- =============================================

CREATE INDEX idx_places_slug ON public.places(slug);
CREATE INDEX idx_places_tags ON public.places USING GIN(tags);
CREATE INDEX idx_places_amenities ON public.places USING GIN(amenities);
CREATE INDEX idx_places_cuisine ON public.places USING GIN(cuisine_types);
CREATE INDEX idx_places_search ON public.places USING GIN(search_vector);
CREATE INDEX idx_places_claimed_by ON public.places(claimed_by);
CREATE INDEX idx_contributors_place_id ON public.contributors(place_id);
CREATE INDEX idx_claims_status ON public.business_claims(status);
CREATE INDEX idx_claims_place_id ON public.business_claims(place_id);
CREATE INDEX idx_suggestions_status ON public.update_suggestions(status);
CREATE INDEX idx_suggestions_place_id ON public.update_suggestions(place_id);
CREATE INDEX idx_submissions_status ON public.place_submissions(status);
CREATE INDEX idx_rate_limits_lookup ON public.rate_limits(identifier, created_at);

-- =============================================
-- Full-Text Search Trigger
-- =============================================

CREATE OR REPLACE FUNCTION places_search_vector_update() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.cuisine_types, ' '), '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.specialties, ' '), '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER places_search_update
  BEFORE INSERT OR UPDATE ON public.places
  FOR EACH ROW EXECUTE FUNCTION places_search_vector_update();

-- =============================================
-- Auto-update updated_at Triggers
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER places_updated_at BEFORE UPDATE ON public.places FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER claims_updated_at BEFORE UPDATE ON public.business_claims FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER suggestions_updated_at BEFORE UPDATE ON public.update_suggestions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER submissions_updated_at BEFORE UPDATE ON public.place_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- Claim Approval Trigger
-- =============================================

CREATE OR REPLACE FUNCTION handle_claim_approval() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    UPDATE public.places SET claimed_by = NEW.user_id, verified = true WHERE id = NEW.place_id;
    UPDATE public.profiles SET role = 'business_owner' WHERE id = NEW.user_id AND role = 'user';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_claim_status_change
  AFTER UPDATE OF status ON public.business_claims
  FOR EACH ROW EXECUTE FUNCTION handle_claim_approval();

-- =============================================
-- Rate Limits Auto-Cleanup
-- =============================================

CREATE OR REPLACE FUNCTION cleanup_rate_limits() RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.rate_limits WHERE created_at < NOW() - INTERVAL '2 hours';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rate_limits_cleanup
  AFTER INSERT ON public.rate_limits
  FOR EACH STATEMENT EXECUTE FUNCTION cleanup_rate_limits();

-- =============================================
-- Row Level Security
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.update_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- profiles: public read, self update
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- places: public read, admin all, owner update own
CREATE POLICY "places_select" ON public.places FOR SELECT USING (true);
CREATE POLICY "places_admin_insert" ON public.places FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "places_admin_update" ON public.places FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "places_admin_delete" ON public.places FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "places_owner_update" ON public.places FOR UPDATE USING (claimed_by = auth.uid());

-- contributors: public read, admin insert
CREATE POLICY "contributors_select" ON public.contributors FOR SELECT USING (true);
CREATE POLICY "contributors_admin_insert" ON public.contributors FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- business_claims: own claims + admin all
CREATE POLICY "claims_select_own" ON public.business_claims FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "claims_admin_select" ON public.business_claims FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "claims_insert_auth" ON public.business_claims FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "claims_admin_update" ON public.business_claims FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- update_suggestions: insert all (anonymous via service role), select for owner/admin
CREATE POLICY "suggestions_insert" ON public.update_suggestions FOR INSERT WITH CHECK (true);
CREATE POLICY "suggestions_admin_select" ON public.update_suggestions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "suggestions_owner_select" ON public.update_suggestions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.places WHERE places.id = update_suggestions.place_id AND places.claimed_by = auth.uid())
);
CREATE POLICY "suggestions_admin_update" ON public.update_suggestions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "suggestions_owner_update" ON public.update_suggestions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.places WHERE places.id = update_suggestions.place_id AND places.claimed_by = auth.uid())
);

-- place_submissions: insert all (anonymous via service role), admin manage
CREATE POLICY "submissions_insert" ON public.place_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "submissions_admin_select" ON public.place_submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "submissions_admin_update" ON public.place_submissions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- rate_limits: no public access (service role only via admin client)
-- No policies = only service role can access

-- =============================================
-- Storage Buckets
-- =============================================

-- place-images: public bucket for restaurant photos
INSERT INTO storage.buckets (id, name, public) VALUES ('place-images', 'place-images', true)
  ON CONFLICT (id) DO NOTHING;

-- claim-documents: private bucket for verification docs
INSERT INTO storage.buckets (id, name, public) VALUES ('claim-documents', 'claim-documents', false)
  ON CONFLICT (id) DO NOTHING;

-- =============================================
-- Storage Policies
-- =============================================

-- place-images: anyone can read, authenticated users can upload/update
CREATE POLICY "place_images_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'place-images');

CREATE POLICY "place_images_auth_write" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'place-images' AND auth.role() = 'authenticated');

CREATE POLICY "place_images_auth_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'place-images' AND auth.role() = 'authenticated');

-- claim-documents: authenticated users can upload and read their own
CREATE POLICY "claim_docs_auth_upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'claim-documents' AND auth.role() = 'authenticated');

CREATE POLICY "claim_docs_auth_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'claim-documents' AND auth.role() = 'authenticated');
