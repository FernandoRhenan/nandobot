import styles from "./notFound.module.css";

export default function ProductNotFound() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Oferta não encontrada</h1>
      <p className={styles.message}>
        Esta oferta não existe ou já saiu do ar. Fique de olho no grupo para as
        próximas promoções.
      </p>
    </main>
  );
}
