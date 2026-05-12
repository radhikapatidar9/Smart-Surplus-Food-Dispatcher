import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const useDonations = (filters = {}) => {
  const token = useAuthStore(state => state.token);
  
  return useQuery({
    queryKey: ['donations', filters],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/donations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data.data;
    },
    enabled: !!token,
    staleTime: 30000, // 30 seconds
  });
};

export const useUpdateDonation = () => {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);

  return useMutation({
    mutationFn: async ({ id, status, metadata }) => {
      const { data } = await axios.patch(`${API_URL}/donations/${id}/status`, 
        { status, ...metadata },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data.data;
    },
    // Optimistic Update
    onMutate: async (updatedDonation) => {
      await queryClient.cancelQueries({ queryKey: ['donations'] });
      const previousDonations = queryClient.getQueryData(['donations', {}]);

      queryClient.setQueryData(['donations', {}], (old) => {
        return old?.map(d => d._id === updatedDonation.id ? { ...d, status: updatedDonation.status } : d);
      });

      return { previousDonations };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['donations', {}], context.previousDonations);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
    },
  });
};
