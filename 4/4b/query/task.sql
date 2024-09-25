SELECT public.task_tb.*, public.collections_tb.user_id AS user FROM public.task_tb INNER JOIN public.collections_tb
	ON public.task_tb."collections_id" = public.collections_tb.id
