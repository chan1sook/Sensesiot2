import dayjs from 'dayjs'

export function getDefaultNewsData() {
  return {
    name: '',
    description: '',
    link: '',
    published: true,
  }
}

export function sortNews(a, b) {
  return dayjs(b.createTime).valueOf() - dayjs(a.createTime).valueOf()
}

export default Object.freeze({
  getDefaultNewsData,
  sortNews,
})
