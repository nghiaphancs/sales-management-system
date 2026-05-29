# AuraSales - Hệ thống Quản lý Bán hàng & Đại lý

AuraSales là một hệ thống quản lý đại lý và bán hàng toàn diện, được xây dựng với kiến trúc hiện đại, cho phép quản lý công nợ, đơn hàng, người dùng (Admin, Leader, Sales), cùng với hệ thống cảnh báo và xử lý hoa hồng tự động (Background Jobs).

## 🚀 Công nghệ sử dụng (Tech Stack)
* **Frontend:** Next.js (App Router), TailwindCSS, Shadcn UI, Zustand.
* **Backend:** Node.js, Express, TypeScript, Prisma ORM, BullMQ.
* **Database & Cache:** PostgreSQL (qua Neon), Redis.
* **DevOps:** Docker, Nginx, Multi-stage builds.

---

## 💻 Hướng dẫn chạy dự án dành cho Development (Sử dụng CMD)

Đây là cách để khởi chạy dự án trong môi trường dev, hỗ trợ Hot-Reloading để thuận tiện cho việc lập trình.

### 1. Yêu cầu cài đặt
* [Node.js](https://nodejs.org/en/) (phiên bản 18 trở lên).
* [Docker Desktop](https://www.docker.com/products/docker-desktop) (chỉ dùng để bật Redis cục bộ).

### 2. Khởi chạy Redis (Bắt buộc cho hàng đợi BullMQ)
Hệ thống sử dụng BullMQ cho background jobs, nên cần có Redis. Mở terminal tại thư mục gốc và chạy:
```bash
docker-compose up -d
```
*Lệnh này sẽ khởi chạy Redis tại cổng 6379.*

### 3. Cài đặt và khởi chạy Backend
Mở một terminal mới (cmd hoặc PowerShell) và làm theo các bước sau:
```bash
# 1. Di chuyển vào thư mục backend
cd backend

# 2. Cài đặt các thư viện
npm install

# 3. Đồng bộ Database Schema với PostgreSQL (nếu cần)
npx prisma db push

# 4. (Tùy chọn) Khởi tạo dữ liệu mẫu
npm run seed

# 5. Khởi chạy backend server
npm run dev
```
*Backend sẽ hoạt động tại địa chỉ: `http://localhost:4000`*

### 4. Cài đặt và khởi chạy Frontend
Mở một terminal mới khác và làm theo các bước sau:
```bash
# 1. Di chuyển vào thư mục frontend
cd frontend

# 2. Cài đặt các thư viện
npm install

# 3. Khởi chạy Next.js development server
npm run dev
```
*Frontend sẽ hoạt động tại địa chỉ: `http://localhost:3000`*

---

## 🐳 Hướng dẫn chạy dự án cho Production (Sử dụng Docker)

Đây là cách đóng gói toàn bộ ứng dụng (kèm Load Balancer Nginx, Next.js Standalone, Node.js + Prisma TS Compiled) vào container chuẩn Production. Đảm bảo bạn đã cài Docker và Docker Compose.

### Khởi chạy toàn bộ hệ thống bằng 1 lệnh duy nhất:
Tại thư mục gốc của dự án `sales-management-system`, chạy lệnh:
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

### Các dịch vụ sau khi chạy:
* **Giao diện (Frontend UI):** Truy cập qua Load Balancer Nginx tại `http://localhost/` (Cổng 80 mặc định).
* **API (Backend):** Sẽ được Nginx tự động điều hướng proxy từ `http://localhost/api/` hoặc `http://localhost/health`.
* **Redis:** Hoạt động ngầm để phân phối message queue.

### Các lệnh Docker thường dùng:
* **Xem logs của toàn bộ hệ thống:**
  ```bash
  docker-compose -f docker-compose.prod.yml logs -f
  ```
* **Tắt toàn bộ hệ thống Production:**
  ```bash
  docker-compose -f docker-compose.prod.yml down
  ```

---

## 📌 Các tài khoản Demo (Nạp từ lệnh \`npm run seed\`)
Nếu bạn đã chạy khởi tạo dữ liệu mẫu, bạn có thể đăng nhập Frontend bằng các tài khoản mặc định dưới đây:
* **Quản trị viên (Admin):** `admin@aurasales.com` / Mật khẩu: `password123`
* **Trưởng nhóm (Leader):** `leader1@aurasales.com` / Mật khẩu: `password123`
* **Nhân viên Sales:** `sales1@aurasales.com` / Mật khẩu: `password123`
