import styles from "./filter-chip-group.module.css";

export type FilterChipOption<T extends string> = {
  value: T;
  label: string;
};

export function FilterChipGroup<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  ariaLabelledBy,
  flush = false,
  contained = false,
}: {
  options: readonly FilterChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  flush?: boolean;
  contained?: boolean;
}) {
  const groupClass = [styles.group, flush ? styles.flush : "", contained ? styles.contained : ""].filter(Boolean).join(" ");
  return (
    <div className={groupClass}>
      <div className={styles.track} role="group" aria-label={ariaLabel} aria-labelledby={ariaLabelledBy}>
        {options.map((option) => (
          <button
            type="button"
            key={option.value || "all"}
            className={option.value === value ? `${styles.chip} ${styles.active}` : styles.chip}
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {!flush && <span className={styles.fade} aria-hidden="true" />}
    </div>
  );
}
