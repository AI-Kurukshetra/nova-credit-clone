-- Allow authenticated users to insert their own row into public.users
create policy users_insert_own
on public.users
for insert
with check (auth.uid() = id);
