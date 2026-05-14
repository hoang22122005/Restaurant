# Hướng Dẫn & Kiến Trúc Dự Án (Architecture & Rules)

Tài liệu này mô tả chi tiết kiến trúc, tech stack và quy tắc thư mục của dự án hiện tại. Bạn có thể sử dụng tài liệu này như một "rulebook" để khởi tạo một dự án mới hoàn toàn tương tự.

---

## 1. Backend (Spring Boot)

### 1.1. Công nghệ sử dụng (Tech Stack)
- **Ngôn ngữ:** Java 17
- **Framework:** Spring Boot 3.4.3
- **Database:** PostgreSQL
- **ORM:** Spring Data JPA
- **Security:** Spring Security + JWT (jjwt 0.11.5)
- **API Documentation:** OpenAPI / Swagger (springdoc-openapi 2.8.5)
- **Utilities:** Lombok, Dotenv (để đọc biến môi trường `.env`), Google API Client (cho OAuth2/Google Login).

### 1.2. Cấu trúc thư mục chuẩn
Backend áp dụng kiến trúc MVC và phân tầng (Layered Architecture).
```text
movie_backend/
├── src/main/java/vn/edu/ptit/movie_backend/
│   ├── config/       # Cấu hình Spring (CORS, Swagger, Beans...)
│   ├── controller/   # Lớp Giao tiếp: Chứa các REST API endpoint (Xử lý HTTP Request/Response)
│   ├── dto/          # Data Transfer Object: Các class nhận/trả dữ liệu (Request/Response payload)
│   ├── exception/    # Xử lý lỗi tập trung (GlobalExceptionHandler) và các Custom Exceptions
│   ├── models/       # Lớp Thực thể: Các Entity class map trực tiếp với Database (JPA/Hibernate)
│   ├── repository/   # Lớp Truy xuất Dữ liệu: Các interface kế thừa JpaRepository để thao tác DB
│   ├── security/     # Lớp Bảo mật: Cấu hình Spring Security, JWT Filter, Custom UserDetailsService
│   ├── service/      # Lớp Nghiệp vụ: Chứa logic xử lý của ứng dụng (Business Logic)
│   └── MovieBackendApplication.java # Entry point
├── src/main/resources/
│   └── application.properties / .yml # File cấu hình DB, server port
├── .env              # File chứa các biến môi trường nhạy cảm (DB_URL, SECRET_KEY)
└── pom.xml           # File quản lý thư viện Maven
```

### 1.3. Lệnh khởi tạo dự án mới
Để tạo một dự án Spring Boot tương tự, bạn có thể truy cập [Spring Initializr](https://start.spring.io/) và chọn:
- **Project:** Maven
- **Language:** Java
- **Spring Boot:** 3.4.x
- **Java:** 17
- **Dependencies:** Spring Web, Spring Data JPA, PostgreSQL Driver, Spring Security, Validation, Lombok.

Hoặc sử dụng Spring CLI / Maven archetype. Sau khi tạo xong, thêm các thư viện JWT, Swagger, Dotenv vào `pom.xml` như dự án gốc.

---

## 2. Frontend (React + Vite)

### 2.1. Công nghệ sử dụng (Tech Stack)
- **Ngôn ngữ:** TypeScript
- **Framework:** React 19 + Vite 6
- **Styling:** Tailwind CSS v4, `clsx`, `tailwind-merge`
- **Routing:** React Router DOM 7
- **Data Fetching/State:** React Query v5 (`@tanstack/react-query`) + Axios
- **UI & Animation:** Lucide React (Icons), Motion (Framer Motion)
- **Linting:** ESLint 9

### 2.2. Cấu trúc thư mục chuẩn
```text
front_end/movie_frontend/
├── public/           # Các tài nguyên public (favicon, hình ảnh tĩnh không qua webpack/vite)
├── src/
│   ├── assets/       # Tài nguyên cục bộ (images, fonts)
│   ├── components/   # Các UI component dùng chung (Button, Navbar, Modal...)
│   ├── hooks/        # Custom React Hooks (vd: useAuth, useFetch)
│   ├── pages/        # Các trang chính của ứng dụng (Home, Login, Profile...)
│   ├── services/     # Chứa các hàm call API (Axios instance, các endpoint gọi về backend)
│   ├── utils/        # Các hàm tiện ích (formatDate, cn, constants...)
│   ├── App.tsx       # Component gốc, định nghĩa Layout và Routing
│   └── main.tsx      # Entry point (Kết nối React vào DOM)
├── .env              # Biến môi trường (VITE_API_URL...)
├── package.json      # Quản lý thư viện NPM
├── tailwind.config.js / postcss.config.js # (Nếu dùng Tailwind v3, Tailwind v4 tích hợp khác)
└── vite.config.ts    # Cấu hình Vite
```

### 2.3. Lệnh khởi tạo dự án mới
Để tạo một Frontend project tương tự, chạy chuỗi lệnh sau trong terminal:

```bash
# 1. Khởi tạo dự án Vite với React + TypeScript
npm create vite@latest my-new-frontend -- --template react-ts

# 2. Di chuyển vào dự án
cd my-new-frontend

# 3. Cài đặt các thư viện cơ bản giống dự án hiện tại
npm install react-router-dom axios @tanstack/react-query lucide-react clsx tailwind-merge motion

# 4. Cài đặt Tailwind CSS v4 và các công cụ dev
npm install tailwindcss @tailwindcss/vite postcss autoprefixer -D
```

---

## 3. Workflow & Quy tắc Phát triển (Development Rules)

1. **API Flow (Backend):**
   - Request -> `Controller` -> Kiểm tra quyền (`Security/JWT`) -> Validate `DTO` -> `Service` (Business logic) -> `Repository` -> Database.
   - Luôn trả về dữ liệu chuẩn thông qua các đối tượng DTO, không trả thẳng Entity ra ngoài để bảo mật.

2. **Data Fetching (Frontend):**
   - Sử dụng `Axios` để thiết lập Base URL và Interceptors (tự động gắn token JWT vào Header).
   - Sử dụng `React Query` (`useQuery`, `useMutation`) trong các components/pages để quản lý trạng thái loading, error, và caching dữ liệu, thay vì dùng `useEffect` + `useState` thủ công.

3. **Môi trường (Environment):**
   - Không commit file `.env` lên git. Luôn có file `.env.example` chứa các key mẫu.

4. **Styling:**
   - Dùng Tailwind CSS để style. Khi cần tạo component tái sử dụng có class động, dùng tiện ích `cn` (kết hợp `clsx` và `tailwind-merge`) để tránh xung đột class.
