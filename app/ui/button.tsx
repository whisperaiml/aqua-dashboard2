import clsx from 'clsx';

// Extend the default button attributes to allow a server action to be passed to
// the `formAction` prop. React's built-in types only allow a `string` for this
// prop, but Next.js Server Actions use a function.
interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'formAction'> {
  children: React.ReactNode;
  formAction?:
    | string
    | ((formData: FormData) => void | Promise<void> | Promise<unknown>);
}

export function Button({ children, className, formAction, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      // Cast is required because React's types only allow a string for `formAction`,
      // but Next.js server actions expect a function here.
      {...(formAction !== undefined ? { formAction: formAction as any } : {})}
      className={clsx(
        'flex h-10 items-center rounded-lg bg-blue-500 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-blue-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
        className,
      )}
    >
      {children}
    </button>
  );
}
