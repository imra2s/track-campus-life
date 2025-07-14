-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('student', 'admin');

-- Create profiles table for additional user info
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create students table
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL UNIQUE,
  roll_number TEXT NOT NULL UNIQUE,
  class TEXT NOT NULL,
  semester INTEGER NOT NULL DEFAULT 1,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  subject TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create syllabus table
CREATE TABLE public.syllabus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  semester INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create PYQs table
CREATE TABLE public.pyqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  semester INTEGER NOT NULL,
  year INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notices table
CREATE TABLE public.notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  posted_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syllabus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pyqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Students policies
CREATE POLICY "Students can view their own data" ON public.students
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all students" ON public.students
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage students" ON public.students
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Attendance policies
CREATE POLICY "Students can view their own attendance" ON public.attendance
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM public.students WHERE id = student_id)
  );

CREATE POLICY "Admins can manage all attendance" ON public.attendance
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Syllabus policies (public read for students)
CREATE POLICY "Students can view syllabus" ON public.syllabus
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('student', 'admin'));

CREATE POLICY "Admins can manage syllabus" ON public.syllabus
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- PYQs policies (public read for students)
CREATE POLICY "Students can view PYQs" ON public.pyqs
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('student', 'admin'));

CREATE POLICY "Admins can manage PYQs" ON public.pyqs
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Notices policies (public read for students)
CREATE POLICY "Students can view notices" ON public.notices
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('student', 'admin'));

CREATE POLICY "Admins can manage notices" ON public.notices
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('syllabus', 'syllabus', true);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('pyqs', 'pyqs', true);

-- Storage policies for syllabus bucket
CREATE POLICY "Students can view syllabus files" ON storage.objects
  FOR SELECT USING (bucket_id = 'syllabus');

CREATE POLICY "Admins can upload syllabus files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'syllabus' AND 
    public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can update syllabus files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'syllabus' AND 
    public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can delete syllabus files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'syllabus' AND 
    public.get_user_role(auth.uid()) = 'admin'
  );

-- Storage policies for pyqs bucket
CREATE POLICY "Students can view PYQ files" ON storage.objects
  FOR SELECT USING (bucket_id = 'pyqs');

CREATE POLICY "Admins can upload PYQ files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'pyqs' AND 
    public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can update PYQ files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'pyqs' AND 
    public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can delete PYQ files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'pyqs' AND 
    public.get_user_role(auth.uid()) = 'admin'
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notices_updated_at
  BEFORE UPDATE ON public.notices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    COALESCE((new.raw_user_meta_data ->> 'role')::user_role, 'student')
  );
  RETURN new;
END;
$$;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();