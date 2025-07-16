-- Add foreign key constraint between students and profiles tables
ALTER TABLE public.students 
ADD CONSTRAINT fk_students_profiles 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) 
ON DELETE CASCADE;