export const logType = {
  info: 'info',
  message: 'message',
};

export function formatTime(input) {
  const date = new Date(input);
  const hours = date.getHours();
  const period = hours >= 12 ? 'PM' : 'AM';
  const newHours = hours > 12 ? hours - 12 : hours;
  return `${newHours}:${('0' + date.getMinutes()).slice(-2)} ${period}`;
}
