import Vue from "vue";
import {router} from "../../router"
const state = {
    products:[]
}

const getters={
    getProducts(state){
        return state.products;
    },
    getProduct(state){
        return key => state.products.filter(element =>{
            return element.key == key; 
        })
    }
}

const mutations={
    updataProductList(state,product){
        state.products.push(product);
    }
}

const actions={
    initApp({commit}){
        //Vue Resource İşlemleri...
        Vue.http.get("https://urun-islemleri-prod-d967f.firebaseio.com/products.json")
        .then(response => {
            let data = response.body;
            for(let key in data){
                data[key].key=key;
                commit("updataProductList",data[key]);
            }
        })
    },
    saveProduct({dispatch,commit,state},product){
        Vue.http.post("https://urun-islemleri-prod-d967f.firebaseio.com/products.json",product)
        .then((response)=>{
            /***********Ürün Listesinin Güncellenmesi ***************/
            product.key=response.body.name;
            commit("updataProductList",product);
            /**********Alış,Satış, Bakiye Güncellenmesi *******/
            let tradeResult = {
                purchase:product.price,
                sale:0,
                count:product.count
            }
            dispatch("setTradeResult",tradeResult)
            router.replace("/");
        })
    },
    sellProduct({state,commit,dispatch},payload){

        //pass by reference
        //pass by value...
        let product = state.products.filter(element =>{
            return element.key == payload.key; 
            
        })

        if(product){
            
            let totalCount = product[0].count - payload.count;
            Vue.http.patch("https://urun-islemleri-prod-d967f.firebaseio.com/products/"+ payload.key + ".json",{count:totalCount} )
            .then(response => {
                console.log(response);
                product[0].count = totalCount;
                /**********Alış,Satış, Bakiye Güncellenmesi *******/
                let tradeResult = {
                    purchase:0,
                    sale:product[0].price,
                    count:payload.count
                }
                dispatch("setTradeResult",tradeResult)
                router.replace("/");
                })
        }

    }
}

export default {
    state,
    getters,
    mutations,
    actions
}