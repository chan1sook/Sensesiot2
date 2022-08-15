import dayjs from 'dayjs'

export function formatDateTime(datetime) {
  if (datetime === null) {
    return '-'
  }

  return dayjs(datetime).format('D MMMM YYYY HH:mm:ss')
}

export default Object.freeze({
  formatDateTime,
})
