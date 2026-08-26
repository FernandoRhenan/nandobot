interface IFormProps {
  onSubmit: () => void;
  children: React.ReactNode;
}

export default function Form({ onSubmit, children }: IFormProps) {
  return (
    <form
      style={{ display: "contents" }}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      {children}
    </form>
  );
}
