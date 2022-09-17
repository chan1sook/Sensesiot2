import dayjs from 'dayjs'

export function getDefaultRedeemCodeData() {
  return {
    name: '',
    description: '',
    quantity: 100,
    setExpired: false,
    expiredDate: dayjs().add(1, 'month').toDate(),
    redeemValue: {
      base: 100,
      sensesiot: 0,
    },
  }
}
export function sortRedeemCodes(a, b) {
  if (a.setExpired !== b.setExpired) {
    return !a.setExpired ? -1 : 1
  }

  return dayjs(a.expiredDate).valueOf() - dayjs(b.expiredDate).valueOf()
}

export function sortRedeemCodeInner(a, b) {
  if (a.used !== b.used) {
    return !a.used ? -1 : 1
  }

  return a.code.localeCompare(b.code)
}

function prettyRedeemValue(key) {
  switch (key) {
    case 'base':
      return 'Coins'
    case 'sensesiot':
      return 'SensesIoT Credits'
    default:
      return key
  }
}
export function redeemValueArr(redeemValue) {
  const keys = Object.keys(redeemValue)
  return keys.reduce((prev, current) => {
    if (redeemValue[current]) {
      prev.push({
        key: current,
        label: prettyRedeemValue(current),
        value: redeemValue[current],
      })
    }
    return prev
  }, [])
}

export default Object.freeze({
  getDefaultRedeemCodeData,
  sortRedeemCodes,
  sortRedeemCodeInner,
  redeemValueArr,
})
