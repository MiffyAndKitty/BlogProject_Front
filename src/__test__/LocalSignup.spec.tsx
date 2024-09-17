import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import LocalSignup from '../login/LocalSignup';
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationProvider } from '../NotificationContext'; // NotificationProvider import

const queryClient = new QueryClient({
    defaultOptions: {},
});

describe("로컬 회원가입 테스트", () => {
    test("비밀번호와 비밀번호 확인 값이 일치하지 않으면 에러메시지가 표시된다.", () => {

        // given - 회원가입 페이지가 그려짐 
        const routes = [
            {
                path: '/signup',
                element: <LocalSignup />
            }
        ];

        const router = createMemoryRouter(routes, {
            initialEntries: ['/signup'],
            initialIndex: 0,
        });

        render(
            <QueryClientProvider client={queryClient}>
                <NotificationProvider>
                    <RouterProvider router={router} />
                </NotificationProvider>
            </QueryClientProvider>
        );

        // when - 비밀번호와 비밀번호 확인 값이 일치하지 않음
        const passwordInput = screen.getByPlaceholderText("비밀번호");
        const passwordConfirmInput = screen.getByPlaceholderText("비밀번호 확인");
        const submitButton = screen.getByRole("button", { name: "회원가입" }); // getByRole로 버튼 선택

        fireEvent.change(passwordInput, { target: { value: 'password1!' } });
        fireEvent.change(passwordConfirmInput, { target: { value: 'differentPassword!' } });
        fireEvent.click(submitButton);

        // 에러 메시지 찾기 부분에서 함수를 사용하여 텍스트를 보다 유연하게 검색
        const errorMessage = screen.getByText((content, element) => {
            return content.includes("비밀번호가 일치하지 않습니다.");
        });
        expect(errorMessage).toBeInTheDocument();

        });
});
