import {ref} from 'vue'
import {defineStore} from 'pinia'

export const useBalanceStore = defineStore('balance', () => {
    const exchangeBalance = ref(0)
    const profit = ref(0)
    const bookmakerBalance = ref(0)

    function increment(amount: number, balance: 'exchange' | 'profit' | 'bookmaker') {
        if (balance === "exchange") {
            exchangeBalance.value += amount
        } else if (balance === "profit") {
            profit.value += amount
        } else if (balance === "bookmaker") {
            profit.value += amount
        }
    }

    return {exchangeBalance, profit, bookmakerBalance, increment}
})
