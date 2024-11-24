import { useEffect, useState } from "react";
import { useGetUser } from "./useGetUser";
import supabase from "../database/supabaseClient";

export const useGetSimulation = () => {
  const { userId } = useGetUser();
  const [simulationId, setSimulationId] = useState('');

  useEffect(() => {
    
    const getSimulation = async () => {
      if(userId) {

        const { data, error } = await supabase
          .from('user_finish_simulations')
          .select('id')
          .eq('user_id', userId)
        
        if(error) {
          console.log('error while retrieving simulation id', error);
        } else if(data && data.length > 0) {
          console.log('success simulation id', data[0].id);
          setSimulationId(data[0].id);
        }

      }
    }

    getSimulation();

  }, [userId])
  
  return { simulationId }
}