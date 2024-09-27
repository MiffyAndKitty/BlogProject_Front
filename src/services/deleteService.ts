import apiClient from './apiClient';
import * as TYPES from '../types/index';

// 토큰을 저장하는 위치 (예: 로컬 스토리지, 상태 관리 등)
const getToken = () => {
  return sessionStorage.getItem('accessToken');
};

/**
 * 카테고리 삭제
 * @param categoryId 
 * @returns 
 */
export const deleteCategory = async (categoryId:string): Promise<any> => {
  const token = getToken();
  const response = await apiClient.delete<TYPES.deleteCategory>(`/category`, {
    headers:{
      'Authorization': `${token}`,
    },
    data:{
        categoryId
    }
  });

  return response.data;
};

/**
 * 게시글 삭제
 * @param boardId 
 * @returns 
 */
export const deletePost = async (boardId:string): Promise<any> => {
  const token = getToken();
  const response = await apiClient.delete<any>(`/board`, {
    headers:{
      'Authorization': `${token}`,
    },
    data:{
      boardId
    }
  });

  return response.data;
};
/**
 * 팔로우 취소
 * @param email 
 * @returns 
 */
export const deleteFollow = async (email: string): Promise<any> => {
  try {
  
    const token = getToken();
    
    // API 요청
    const response = await apiClient.delete<any>(`/users/follow`, {
      headers: {
        'Authorization': `${token}`,
      },
      data: {
        email: email
      }
    });


    return response;
  } catch (error) {
    console.error("Error in deleteFollow:", error); // 오류 로그
    throw error; // 오류를 호출한 쪽에서 처리할 수 있도록 전달
  }
};
/**
 * 새소식 삭제
 * @param email 
 * @returns 
 */
export const deleteNotification  = async (notificationId: string): Promise<any> => {
  try {
   
    const token = getToken();
    
    // API 요청
    const response = await apiClient.delete<any>(`/notifications`, {
      headers: {
        'Authorization': `${token}`,
      },
      data: {
        notificationId: notificationId
      }
    });


    return response;
  } catch (error) {
    console.error("Error in deleteNotification:", error); // 오류 로그
    throw error; // 오류를 호출한 쪽에서 처리할 수 있도록 전달
  }
}; 
/**
 * 임시저장된 게시글 삭제
 * @param email 
 * @returns 
 */
export const deleteTempPost  = async (draftId: string): Promise<any> => {
  try {

    const token = getToken();
    
    // API 요청
    const response = await apiClient.delete<any>(`/draft`, {
      headers: {
        'Authorization': `${token}`,
      },
      data: {
        draftId: draftId
      }
    });

  
    return response;
  } catch (error) {
    console.error("Error in deleteNotification:", error); // 오류 로그
    throw error; // 오류를 호출한 쪽에서 처리할 수 있도록 전달
  }
}; 
/**
 * 댓글 좋아요/싫어요 삭제
 * @param email 
 * @returns 
 */
export const deleteCommentLike  = async (commentId: string): Promise<any> => {
  try {

    const token = getToken();
    
    // API 요청
    const response = await apiClient.delete<any>(`/comment/like`, {
      headers: {
        'Authorization': `${token}`,
      },
      data: {
        commentId: commentId
      }
    });

 
    return response;
  } catch (error) {
    console.error("Error in deleteCommentLike:", error); // 오류 로그
    throw error; // 오류를 호출한 쪽에서 처리할 수 있도록 전달
  }
}; 

/**
 * 댓글 삭제
 * @param email 
 * @returns 
 */
export const deleteComment  = async (commentId: string): Promise<any> => {
  try {

    const token = getToken();
    
    // API 요청
    const response = await apiClient.delete<any>(`/comment`, {
      headers: {
        'Authorization': `${token}`,
      },
      data: {
        commentId: commentId
      }
    });

 
    return response;
  } catch (error) {
    console.error("Error in deleteComment:", error); // 오류 로그
    throw error; // 오류를 호출한 쪽에서 처리할 수 있도록 전달
  }
}; 

/**
 * 로컬 사용자 계정 탈퇴
 * @param email 
 * @returns 
 */
export const deleteUser  = async (): Promise<any> => {
  try {
    const token = getToken();
    
    // API 요청
    const response = await apiClient.delete<any>(`/account`, {
      headers: {
        'Authorization': `${token}`,
      },
    });

    return response;
  } catch (error) {
    console.error("Error in deleteUser:", error); // 오류 로그
    throw error; // 오류를 호출한 쪽에서 처리할 수 있도록 전달
  }
}; 

/**
 * 구글 사용자 계정 탈퇴
 * @param email 
 * @returns 
 */
export const deleteGoogleUser  = async (): Promise<any> => {
  try {
    const token = getToken();
    
    // API 요청
    const response = await apiClient.delete<any>(`/account/google`, {
      headers: {
        'Authorization': `${token}`,
      },
    });

    return response;
  } catch (error) {
    console.error("Error in deleteUser:", error); // 오류 로그
    throw error; // 오류를 호출한 쪽에서 처리할 수 있도록 전달
  }
}; 