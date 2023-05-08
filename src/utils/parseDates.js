export const setDateTN = (date) => {
  const datetime = new Date(
    new Date(date).toLocaleString('sv-SE', {
      timeZone: 'America/Argentina/Buenos_Aires',
    })
  )

  datetime.setHours(datetime.getHours())

  return datetime
}

export const setDateML = (date) => {
  const datetime = new Date(
    new Date(date).toLocaleString('sv-SE', {
      timeZone: 'America/Argentina/Buenos_Aires',
    })
  )

  datetime.setHours(datetime.getHours())
  return datetime
}
