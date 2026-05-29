# Kế hoạch Triển khai (Implementation Plan): Hệ thống Quản lý Bán hàng & Đại lý

Với vai trò là Senior Solution Architect và Lead Engineer, dưới đây là lộ trình chi tiết để xây dựng hệ thống từ con số 0 đến một MVP đạt chuẩn Production, chú trọng vào kiến trúc (clean architecture), khả năng mở rộng (scalability), và trải nghiệm lập trình (Developer Experience - DX).

## 1. Kiến trúc Tổng thể & Tech Stack

Để đảm bảo hệ thống nhẹ, dễ code (DX tốt) nhưng vẫn đủ mạnh cho Production, chúng ta sẽ sử dụng hệ sinh thái JavaScript/TypeScript toàn diện:

*   **Frontend (PWA):** `Next.js` (App Router) + `TailwindCSS` + `Shadcn UI` (Xây dựng component nhanh, chuẩn thiết kế đẹp). `Zustand` để quản lý state.
*   **Backend (REST API):** `Node.js` với `Express` + `TypeScript`. Sử dụng mô hình Controller-Service-Repository để tách biệt logic. `Zod` để validate dữ liệu đầu vào.
*   **ORM:** `Prisma` (Cung cấp Type-safety tuyệt đối từ DB lên code, DX xuất sắc).
*   **Database:** `PostgreSQL` (Xử lý giao dịch đơn hàng và công nợ).
*   **Background Jobs / Cache:** `Redis` + `BullMQ` (Xử lý hàng đợi gửi Email, tính toán hoa hồng bất đồng bộ).
*   **Local Environment:** 100% chạy qua `Docker` và `docker-compose`.

## 2. Cấu trúc Thư mục (Monorepo-style)

Sử dụng cấu trúc thư mục phẳng, quản lý các service độc lập nhưng nằm chung một repo để dễ quản lý.

```text
/sales-management-system
├── backend/                  # Chứa mã nguồn Node.js/Express
│   ├── src/
│   │   ├── controllers/      # Xử lý Request/Response
│   │   ├── services/         # Business Logic (Order, Commission...)
│   │   ├── middlewares/      # Auth, RBAC, Error Handling
│   │   ├── workers/          # BullMQ Processors (Background jobs)
│   │   └── utils/
│   ├── prisma/               # Schema và Migrations
│   ├── Dockerfile
│   └── package.json
├── frontend/                 # Chứa mã nguồn Next.js PWA
│   ├── src/
│   │   ├── app/              # Next.js App Router (Pages & API Routes)
│   │   ├── components/       # UI Components (Shadcn/Tailwind)
│   │   ├── lib/              # Axios instance, Utils
│   │   └── store/            # Zustand stores
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml        # Định nghĩa Postgres, Redis, PgAdmin
└── README.md
```

## 3. Lộ trình Triển khai Chi tiết (6 Phases)

### Phase 1: Môi trường & Nền tảng (Infra & Boilerplate)
**Mục tiêu:** Setup môi trường local, gõ 1 lệnh là chạy được toàn bộ DB.
1.  Tạo `docker-compose.yml` gồm các service: `postgres` (DB), `redis` (Cache/Queue), và `pgadmin` (UI xem database).
2.  Khởi tạo `backend` (Express, TypeScript, Cấu hình ESLint/Prettier).
3.  Khởi tạo `frontend` (Next.js, cấu hình Tailwind, cài đặt Next-PWA).

### Phase 2: Thiết kế Database & Prisma ORM
**Mục tiêu:** Định hình xương sống dữ liệu của hệ thống.
1.  Cài đặt Prisma trong backend.
2.  Viết file `schema.prisma` định nghĩa các model:
    *   `User` (Enum Role: ADMIN, LEADER, SALES).
    *   `Agency` (Lưu `creditLimit`, `currentDebt`).
    *   `Product`, `Order`, `OrderItem`.
    *   `Payment` (Ghi nhận trả nợ).
    *   `Visit` (Lưu GPS `lat`, `lng`).
    *   `KpiTarget`, `Commission`.
3.  Tạo script `seed.ts` để sinh dữ liệu giả (1 Admin, 2 Leader, 10 Sales, 50 Đại lý, Sản phẩm) phục vụ test.

### Phase 3: Xây dựng Backend Core APIs
**Mục tiêu:** Hoàn thiện các API cốt lõi để PWA có thể gọi.
1.  **Auth Module:** API Login, tạo JWT token. Middleware check roles (`isAdmin`, `isLeader`, `isSales`).
2.  **Agency & Product Module:** API CRUD cơ bản.
3.  **Order Module (Rất quan trọng):** 
    *   Sử dụng *Prisma Interactive Transactions*. Khi tạo `Order`, phải tự động cộng số tiền vào `currentDebt` của `Agency`.
    *   Check logic: Nếu `currentDebt + totalAmount > creditLimit` -> Reject báo lỗi vượt hạn mức.
4.  **Payment Module:** API thanh toán công nợ (Tạo Payment record + trừ `currentDebt`).
5.  **Visit Module:** API nhận tọa độ check-in từ Sales.

### Phase 4: Background Jobs & Commission Engine
**Mục tiêu:** Xử lý các tác vụ nặng không đồng bộ.
1.  Tích hợp `BullMQ` nối với Redis.
2.  Tạo **Email Worker**: Viết job gửi thông báo (dùng Nodemailer + Mailtrap để test local). Kích hoạt bắn sự kiện khi có đơn hàng mới vượt ngưỡng.
3.  Tạo **Commission Worker**: Viết logic quét toàn bộ Order trong tháng, so sánh với KPI target và xuất ra bảng hoa hồng `Commission`. Setup Cronjob chạy hàm này vào ngày cuối tháng.

### Phase 5: Xây dựng Frontend (PWA)
**Mục tiêu:** Lên hình giao diện cho Admin và Sales.
1.  Tích hợp UI Framework (Shadcn UI) để thiết kế form, bảng, nút bấm cực nhanh và đồng nhất.
2.  **Luồng Sales (Mobile View):**
    *   Màn hình Danh sách Đại lý (Search/Filter).
    *   Màn hình Check-in (Sử dụng `navigator.geolocation.getCurrentPosition`).
    *   Màn hình Tạo đơn hàng (Thêm giỏ hàng, hiển thị công nợ hiện tại để Sales nhắc khéo Đại lý).
3.  **Luồng Admin/Leader (Desktop View):**
    *   Dashboard biểu đồ doanh số (Recharts hoặc Chart.js).
    *   Quản lý danh sách Nhân viên, Đại lý (Cấp hạn mức nợ).
    *   Báo cáo: Xuất file CSV (cơ bản).

### Phase 6: Hoàn thiện & Dockerization cho Production
**Mục tiêu:** Đóng gói toàn bộ chạy mượt mà trên server thật.
1.  Viết `Dockerfile` tối ưu (Multi-stage build) cho Backend.
2.  Viết `Dockerfile` cho Frontend (Next.js standalone output).
3.  Tạo `docker-compose.prod.yml` để chạy stack hoàn chỉnh: Load Balancer (Nginx) -> Frontend Container -> Backend Container -> DB/Redis.
