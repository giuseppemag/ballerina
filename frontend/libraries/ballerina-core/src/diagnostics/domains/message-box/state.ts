export const messageBox = <a>(message: string, value: () => a): a => {
  alert(message);
  return value();
};
