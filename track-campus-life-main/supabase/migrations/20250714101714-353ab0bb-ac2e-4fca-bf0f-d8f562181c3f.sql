
-- First, let's make sure we handle the student record creation in the trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    COALESCE((new.raw_user_meta_data ->> 'role')::public.user_role, 'student')
  );

  -- If the user is a student, also create a student record
  IF COALESCE((new.raw_user_meta_data ->> 'role')::public.user_role, 'student') = 'student' THEN
    INSERT INTO public.students (
      user_id,
      student_id,
      roll_number,
      class,
      semester
    )
    VALUES (
      new.id,
      new.raw_user_meta_data ->> 'student_id',
      new.raw_user_meta_data ->> 'roll_number',
      new.raw_user_meta_data ->> 'class',
      COALESCE((new.raw_user_meta_data ->> 'semester')::integer, 1)
    );
  END IF;

  RETURN new;
END;
$$;
