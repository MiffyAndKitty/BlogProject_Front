/**
 * 각 API 응답에 대한 인터페이스를 정의
 */
export interface User {
    id: number;
    name: string;
    email: string;
}
export interface Post {
    id: number;
    title: string;
    content: string;
    authorId: number;
} 

export interface Numbers {
    num1: string,
    num2: string
}

export interface SignUpData {
    email:string,
    password:string,
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