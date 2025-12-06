-- Usunięcie polityki RLS która eksponuje wrażliwe dane zdrowotne przyjaciołom
-- Przyjaciele powinni uzyskiwać dostęp do profili TYLKO przez bezpieczną funkcję get_friend_profile()

DROP POLICY IF EXISTS "Friends can view limited profile data" ON public.profiles;

-- Polityka "Users can view own profile" pozostaje bez zmian - użytkownicy nadal mogą widzieć swój własny profil