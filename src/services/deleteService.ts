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
  console.log(categoryId,response.data)
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
  console.log(boardId,response.data)
  return response.data;
};
/**
 * 팔로우 취소
 * @param email 
 * @returns 
 */
export const deleteFollow = async (email: string): Promise<any> => {
  try {
    console.log("deleteFollow called with email:", email); // 함수 호출 확인
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

    console.log("API response:", response); // API 응답 확인
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
    console.log("deleteNotification called with email:", notificationId); // 함수 호출 확인
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

    console.log("API response:", response); // API 응답 확인
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
    console.log("deleteCommentLike called with commentId:", commentId); // 함수 호출 확인
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

    console.log("API response:", response); // API 응답 확인
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
    console.log("deleteCommentLike called with commentId:", commentId); // 함수 호출 확인
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

    console.log("API response:", response); // API 응답 확인
    return response;
  } catch (error) {
    console.error("Error in deleteComment:", error); // 오류 로그
    throw error; // 오류를 호출한 쪽에서 처리할 수 있도록 전달
  }
}; 

/**
 * 데이터베이스에서 사용자의 계정을 삭제 상태로 변경합니다.
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

    console.log("API response:", response); // API 응답 확인
    return response;
  } catch (error) {
    console.error("Error in deleteUser:", error); // 오류 로그
    throw error; // 오류를 호출한 쪽에서 처리할 수 있도록 전달
  }
}; 