-- Supabase PostgreSQL Schema for EV Real Range & Reliability Global Tracker

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: vehicles
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(brand, model)
);

-- Table: reports
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- e.g., 'Real Range', 'Mechanical', 'Battery', 'Positives'
    description TEXT NOT NULL,
    source_link VARCHAR(2048) UNIQUE, -- Used for deduplication
    source_count INTEGER DEFAULT 1 NOT NULL,
    report_date DATE NOT NULL,
    language_original VARCHAR(10) NOT NULL, -- e.g., 'EN', 'PT', 'FR'
    contradictory_info BOOLEAN DEFAULT FALSE NOT NULL,
    estimated_range_km NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safe migration for existing databases
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS contradictory_info BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS estimated_range_km NUMERIC(10, 2);

-- Table: stats
CREATE TABLE IF NOT EXISTS public.stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    average_range_km NUMERIC(10, 2),
    average_range_miles NUMERIC(10, 2),
    total_reports INTEGER DEFAULT 0 NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(vehicle_id)
);

-- Indexes for high-speed search
CREATE INDEX IF NOT EXISTS idx_vehicles_brand_model ON public.vehicles (brand, model);
CREATE INDEX IF NOT EXISTS idx_reports_vehicle_id ON public.reports (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_reports_type ON public.reports (type);
CREATE INDEX IF NOT EXISTS idx_stats_vehicle_id ON public.stats (vehicle_id);

-- Row Level Security (RLS) for public read access via NEXT_PUBLIC_SUPABASE_ANON_KEY
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'vehicles' AND policyname = 'Allow public read access on vehicles'
    ) THEN
        CREATE POLICY "Allow public read access on vehicles"
            ON public.vehicles FOR SELECT
            USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'reports' AND policyname = 'Allow public read access on reports'
    ) THEN
        CREATE POLICY "Allow public read access on reports"
            ON public.reports FOR SELECT
            USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'stats' AND policyname = 'Allow public read access on stats'
    ) THEN
        CREATE POLICY "Allow public read access on stats"
            ON public.stats FOR SELECT
            USING (true);
    END IF;
END
$$;

