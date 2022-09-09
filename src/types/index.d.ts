/**
 * Specify which values should be optional
 */
type Hide<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
