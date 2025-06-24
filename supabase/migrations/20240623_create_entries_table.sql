-- Create entries table
CREATE TABLE IF NOT EXISTS public.entries (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS entries_user_id_idx ON public.entries(user_id);
CREATE INDEX IF NOT EXISTS entries_created_at_idx ON public.entries(created_at);

-- Create RLS policies
-- Allow users to select their own entries
CREATE POLICY "Users can view their own entries" ON public.entries
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own entries
CREATE POLICY "Users can create their own entries" ON public.entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own entries
CREATE POLICY "Users can update their own entries" ON public.entries
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own entries
CREATE POLICY "Users can delete their own entries" ON public.entries
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_entries_updated_at 
    BEFORE UPDATE ON public.entries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 