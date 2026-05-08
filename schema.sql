-- Supabase PostgreSQL Schema for EV Real Range & Reliability Global Tracker

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: vehicles
CREATE TABLE public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(brand, model)
);

-- Table: reports
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- e.g., 'Real Range', 'Mechanical', 'Battery', 'Positives'
    description TEXT NOT NULL,
    source_link VARCHAR(2048) UNIQUE, -- Used for deduplication
    source_count INTEGER DEFAULT 1 NOT NULL,
    report_date DATE NOT NULL,
    language_original VARCHAR(10) NOT NULL, -- e.g., 'EN', 'PT', 'FR'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: stats
CREATE TABLE public.stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    average_range_km NUMERIC(10, 2),
    average_range_miles NUMERIC(10, 2),
    total_reports INTEGER DEFAULT 0 NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(vehicle_id)
);

-- Indexes for high-speed search
CREATE INDEX idx_vehicles_brand_model ON public.vehicles (brand, model);
CREATE INDEX idx_reports_vehicle_id ON public.reports (vehicle_id);
CREATE INDEX idx_reports_type ON public.reports (type);
CREATE INDEX idx_stats_vehicle_id ON public.stats (vehicle_id);
