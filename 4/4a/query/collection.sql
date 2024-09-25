SELECT public.collections_tb.*, public.users_tb.username AS username FROM public.collections_tb INNER JOIN public.users_tb 
	ON public.collections_tb."user_id" = public.users_tb.id
