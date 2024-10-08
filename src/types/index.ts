/**
 * 각 API 응답에 대한 인터페이스를 정의
 */
// export interface User {
//     id: number;
//     name: string;
//     email: string;
// }
// export interface Post {
//     id: number;
//     title: string;
//     content: string;
//     authorId: number;
// } 

// export interface Numbers {
//     num1: string,
//     num2: string
// }

export interface SignUpData {
    email:string,
    password?:string,
    provider?:string,
    nickname:string
}

export interface CheckDuplicatedData {
    column:string, //user_email, user_nickname 중 하나 
    data:string, //공백 X
}

export interface loginData {
    email:string,
    password:string, 
}

export interface newPost {
    draftId?:string,
    title:string,
    content:string,
    public:Boolean,
    categoryId:string,
    tagNames:Array<string>,
    uploaded_files: Blob[]| null,
    boardId?: string,
}

export interface getPost{
    board_content: string
    board_id: string
    board_like: number
    board_order: number
    board_public: number
    board_title:string
    board_view: number
    category_id: string
    created_at: string
    user_nickname : string
    deleted_at: null | string
    updated_at: string
    user_id: string
    board_comment: number
    category_name:string
    user_email:string
}



export interface getPostDetail{
    isLike: string,
    isWriter: Boolean
    board_id: string,
    user_id: string,
    category_id: string,
    board_title: string,
    board_content: string,
    board_view: number,
    board_like: number
    board_public : 0 | 1,
    created_at: string,
    updated_at:string,
    deleted_at : null | string,
    user_nickname : string
    board_comment:number,
    tags: string[],
    imageSizes: {
        sizes: { [key: string]: number }[]; // 각 이미지의 URL과 해당 크기를 담은 객체 배열
        totalSize: number; // 전체 이미지 크기 합계 등 추가적인 정보가 필요한 경우
      };
    
    
}
export interface category {
    category_id:string,
    category_name:string,
}

export interface categories {
    category_id: string;
    category_name: string;
    subcategories: categories[];
    board_count: number;
}

export interface newCategory {
    categoryName:string,
    topcategoryId:string,
}

export interface deleteCategory {
    categoryId:string,
}

export interface changeCategory {
    categoryName:string,
    categoryId: string
}

export interface userData{
    isSelf: Boolean,
    user_id: string,
    created_at: string,
    updated_at:string,
    user_nickname : string
    user_email:string
    user_image:File | null
    user_message:string | null
    user_password: string | null
    user_provider:string | null
}

export interface commentData{
    boardId:string,
    parentCommentId:string,
    commentContent:string
}