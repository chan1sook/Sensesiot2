export default function ({ store, error }) {
  const role = store.getters.role
  if (!['developer', 'adsmanager'].includes(role)) {
    error({
      statusCode: 404,
      message: 'This page could not be found',
    })
  }
}
