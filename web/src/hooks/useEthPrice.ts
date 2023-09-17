import { useEffect, useState } from "react"

export const useEthPrice = () => {

  const [price, setPrice] = useState(0)

  const update = async () => {
    setPrice(1000)
  }

  useEffect(() => {
    setInterval(() => {
      update()
    }, 60 * 1000)
  }, [])

  return {
    price,
    update
  }
}