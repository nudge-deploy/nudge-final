import { useEffect, useState } from "react";
import { useGetUser } from "./useGetUser";
import supabase from "../database/supabaseClient";
import { UserPurchase } from "../interface/SimulationInterface";
import { useGetSimulation } from "./useGetSimulation";

export const useGetUserBalance = () => {

  const { userId } = useGetUser();
  const { simulationId } = useGetSimulation();
  const questionId = "6d06b8b9-c3fa-4309-832c-222f3cb674db";
  const [balance, setBalance] = useState<string>();
  const [dummyBalance, setDummyBalance] = useState<number>();
  const [balanceAfterPurchase, setBalanceAfterPurchase] = useState<number>();
  const [remainingPercentage, setRemainingPercentage] = useState<number>();
  const [percentageSpent, setPercentageSpent] = useState<number>();

  // loading, to be exported to simulation page
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  function getUpperBound(input: string) {
    return parseInt(input[0].slice(-10));  
  }

  async function getResponseForBalance() {
    const { data, error } = await supabase
      .from('user_responses')
      .select('*')
      .eq('user_id', userId)
      .eq('question_id', questionId)
    
    if(error) {
      console.log('error while fetching response for balance');
    }

    if(data && data[0] && data[0].response) {
      console.log('ada resp balance');
      setBalance(data[0].response);
    } else {
      console.log('tidak ada resp balance');
      setDummyBalance(1000000000);
    }
  }

  useEffect(() => {
    if(userId && questionId) {
      getResponseForBalance()
    }
  }, [userId, questionId]);

  useEffect(() => {
    console.log('balance before anything: ', balance);
    if(balance) {
      if(balance.length > 0) {
        const newBalance = getUpperBound(balance);
        console.log('new balance after conversion: ', newBalance);
        setDummyBalance(newBalance * 24000000);
      }
    }
  }, [balance]);

  const [userPurchases, setUserPurchases] = useState<UserPurchase[]>([]);
  async function fetchUserPurchase() {
    setPurchaseLoading(true);
    const { data, error } = await supabase
      .from('user_purchases')
      .select('*')
      .eq('simulation_id', simulationId)
      .eq('user_id', userId)
    
    if(error) {
      console.log('error while fetching user purchase', error);
    }
    if(data) {
      console.log('data user purchases: ', data);
      setUserPurchases(data);
      setPurchaseLoading(false);
    }
  }

  useEffect(() => {
    if(userId && simulationId) {
      fetchUserPurchase();
    }
  }, [userId, simulationId])
  
  useEffect(() => {
    if(userId && dummyBalance && userPurchases && userPurchases.length > 0) {
      console.log('ADA USER PURCHASES');

      // Calculating remaining amount of balance
      let finalAmount = dummyBalance;
      userPurchases.forEach((userPurchase) => {
        
        // Subtracting balance with user purchases
        console.log('dummy balance on user purchase: ', dummyBalance);

        let amountPurchased = ((userPurchase.percentage_purchased/100) * dummyBalance)
        finalAmount = finalAmount - amountPurchased;
        console.log('amount purchased: ', amountPurchased);
        console.log('change of final amount: ', finalAmount);
        
      });
      console.log('FINAL amount: ', finalAmount);

      setBalanceAfterPurchase(finalAmount);
      
      setPercentageSpent(100 - (finalAmount / dummyBalance)*100);
      setRemainingPercentage((finalAmount / dummyBalance)*100);

    }
    else {
      // console.log('TIDAK ADA USER PURCHASES');
      setPercentageSpent(0);
      setRemainingPercentage(100);
    }
  }, [userPurchases, userId, dummyBalance])

  return { 
    dummyBalance, 
    balanceAfterPurchase, 
    userPurchases, 
    fetchUserPurchase, 
    percentageSpent,
    remainingPercentage,
    purchaseLoading }
}