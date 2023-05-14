import dayjs from 'dayjs'

export function getDefaultAdsData() {
  return {
    name: '',
    description: '',
    ytVidUrl: '',
    ytVidId: '',
    durationSec: 60,
    published: false,
  }
}

export function sortAds(a, b) {
  return dayjs(b.createTime).valueOf() - dayjs(a.createTime).valueOf()
}

export default Object.freeze({
  getDefaultAdsData,
  sortAds,
})
