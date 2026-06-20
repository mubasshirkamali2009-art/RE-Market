'use server'

 const baseUrl=process.env.NEXT_PUBLIC_BASE_URL
export const createProduct = async(newProductData) => {
    try {
       console.log(newProductData)
       console.log(JSON.stringify(newProductData))
    const res=await fetch(`${baseUrl}/api/products` , {
        method:'POST',
        headers:{
            'Content-Type' : 'application/json',
        },
        body: JSON.stringify(newProductData) ,

    })

    return await res.json(); 
    } catch (error) {
        console.log(error)
        return {}
    }
}

  
 