-- Agregar campos específicos para fisioterapeutas y usuarios
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS specialties text[],
ADD COLUMN IF NOT EXISTS license_number text,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS phone text;

-- Actualizar constraint de roles para incluir 'staff'
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('super_admin', 'clinic_manager', 'physio', 'staff', 'patient'));

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_profiles_clinic_role ON public.profiles(clinic_id, role);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
