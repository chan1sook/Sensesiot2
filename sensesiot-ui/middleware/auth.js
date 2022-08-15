export default function ({ redirect, store }) {
  const role = store.getters.role
  if (role === 'guest') {
    return redirect('/')
  }
}
