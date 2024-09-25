select public.collections_tb.*, public.users_tb.username as username, public.task_tb.name as task_name
from public.collections_tb
inner join public.users_tb on public.collections_tb."user_id" = public.users_tb.id
inner join public.task_tb on public.collections_tb."id" = public.task_tb.id