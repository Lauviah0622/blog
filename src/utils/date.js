import dayjs from 'dayjs';

const formatDate = (date) => dayjs(date).format('MMM,DD YYYY');

export { formatDate };
