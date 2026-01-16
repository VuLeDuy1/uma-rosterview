function stateStorage<T>(key: string, defaultValue: T) {
  const valueJSON = localStorage.getItem(key);
  const value = valueJSON ? JSON.parse(valueJSON) : defaultValue;
  const stateValue = $state({ value });
  $effect(() => {
    localStorage.setItem(key, JSON.stringify(stateValue.value));
  });
  return stateValue;
}

export { stateStorage };
