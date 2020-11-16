// get the data of Cart json

export const cartjson = {

    state: {
        cartData: []
    },

    getProductJson(){
        axios({
            method: 'get',
            url: `/cart?view=json`,
            headers: {
                'X-Requested-With': ''
            },
            responseType: 'json'
        }).then( response => {  
            // console.log(response.data)
            this.state.cartData.push(response.data);
        })
        .catch( error => {
            console.log(error)
        }); 
    }
}