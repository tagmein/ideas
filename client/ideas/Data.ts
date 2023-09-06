export const data_tools = {
 async make_query<T>(query: string, params?: any[]): Promise<T> {
  const body = JSON.stringify({
   query,
   params,
  })
  const response = await fetch('/data', {
   method: 'post',
   headers: {
    'Content-Length': body.length.toString(10),
    'Content-Type': 'application/json',
   },
   body,
  })
  if (response.ok) {
   return response.json()
  } else {
   throw new Error(response.statusText)
  }
 },
}
