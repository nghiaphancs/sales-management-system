Prompt 1: Tôi muốn xây dựng một hệ thống quản lý bán hàng và quản lý đội sale.

Mô hình hoạt động gồm 2 cấp:

* Sales
* Đại lý

Hệ thống cần hỗ trợ:

* Quản lý đội sale
* Quản lý đại lý
* Track doanh số
* Theo dõi KPI
* Theo dõi hiệu suất bán hàng
* Phân quyền theo vai trò
* Dashboard thống kê
* Theo dõi lịch sử giao dịch và hoạt động

Hãy brainstorm toàn bộ hệ thống cho tôi.

Yêu cầu:

* Hỏi tôi từng câu nhỏ một
* Không hỏi quá nhiều trong một lần
* Khi hỏi hãy đưa ra option dạng A/B/C để tôi trả lời nhanh
* Nếu cần thì hãy giải thích ngắn gọn ưu nhược điểm của từng option
* Mục tiêu là giúp tôi làm rõ:

  * business flow
  * user roles
  * permission
  * tracking logic
  * commission logic
  * KPI
  * database structure
  * dashboard
  * backend architecture
  * frontend modules
  * mobile/web app
  * scalability
  * notification system
  * reporting system

Sau khi brainstorm xong:

1. Hãy tổng hợp requirement hoàn chỉnh
2. Đề xuất kiến trúc hệ thống phù hợp
3. Đề xuất tech stack
4. Đề xuất database schema
5. Đề xuất roadmap phát triển MVP → Production
6. Chỉ bắt đầu code khi tôi xác nhận plan cuối cùng

Hãy đóng vai một senior solution architect + product owner + CTO.

Output:
❓ Câu hỏi 1: Mối quan hệ giữa "Sales" và "Đại lý" hoạt động như thế nào?
Bạn vui lòng chọn một mô hình hoạt động cốt lõi của doanh nghiệp:

Option A: Sales của công ty quản lý Đại lý (Sales B2B).
Mô tả: Công ty thuê Sales. Nhiệm vụ của Sales là đi tìm kiếm, chăm sóc và hỗ trợ các Đại lý. Doanh số của Sales được tính dựa trên doanh số nhập hàng của các Đại lý mà họ quản lý.
Option B: Đại lý quản lý Sales (Mô hình đa cấp/Chi nhánh).
Mô tả: Công ty cấp quyền cho Đại lý. Sau đó, Đại lý tự tuyển Sales riêng của họ để đi bán hàng. Doanh số của Đại lý là tổng doanh số của các Sales dưới quyền.
Option C: Hoạt động độc lập và song song.
Mô tả: Sales tự đi bán lẻ trực tiếp cho khách hàng cuối (End-user). Đại lý cũng tự mua hàng/bán hàng. Cả hai đều báo cáo trực tiếp về cho Công ty (Admin) chứ không có quan hệ quản lý lẫn nhau.
Bạn nghiêng về Option nào (A, B, hay C)? Hoặc nếu là một mô hình khác, hãy cho tôi biết nhé!

Prompt: tôi chọn Option A

Output:
❓ Câu hỏi 2: Ai là người trực tiếp tạo Đơn hàng (Order) trên hệ thống?
Option A: Đại lý tự đặt hàng (Self-service)
Mô tả: Đại lý có tài khoản đăng nhập vào app/web riêng để tự chọn mặt hàng và đặt đơn. Sales quản lý Đại lý đó sẽ nhận được thông báo và theo dõi tiến độ đơn hàng.
Ưu điểm: Giảm thiểu công việc thủ công cho Sales, hệ thống tự động hóa cao.
Option B: Sales tạo đơn thay cho Đại lý (DSD - Direct Store Delivery)
Mô tả: Sales đi thị trường, thăm hỏi Đại lý, kiểm tra tồn kho và dùng app của Sales để tạo đơn hàng hộ Đại lý.
Ưu điểm: Đại lý không cần thao tác phần mềm (phù hợp với đại lý truyền thống, tạp hóa). Sales nắm chắc 100% tình hình tuyến.
Option C: Cả hai luồng trên (Omnichannel)
Mô tả: Đại lý có thể tự chủ động lên đơn trên app của họ, nhưng nếu họ quên hoặc không rành công nghệ, Sales vẫn có thể lên đơn hộ khi đi tuyến.
Ưu điểm: Linh hoạt tối đa cho cả hai bên.
Bạn chọn luồng nào (A, B hay C)?

Prompt: Tôi chọn Option B

Output:
❓ Câu hỏi 3: KPI và Hoa hồng của Sales được tính theo phương pháp nào?
Hệ thống cần theo dõi những chỉ số nào để đánh giá hiệu suất của một bạn Sales?

Option A: Dựa trên Doanh thu thuần (Cơ bản)
Mô tả: Đơn giản, rõ ràng. Hoa hồng = % Doanh thu từ các đơn hàng hợp lệ (đã giao thành công/đã thanh toán) của Đại lý.
Ưu điểm: Dễ triển khai, dễ hiểu cho Sales, hệ thống xử lý nhanh.
Option B: Đa chỉ tiêu (Hành vi + Doanh thu)
Mô tả: KPI và thưởng phụ thuộc vào nhiều yếu tố kết hợp: Doanh số đạt được + Số lượng Đại lý mới mở thêm + Tần suất viếng thăm (Check-in tọa độ/Chụp ảnh) Đại lý theo tuyến.
Ưu điểm: Quản lý chặt chẽ được tác phong làm việc của Sales, độ phủ thị trường. Cần tích hợp thêm tính năng GPS/Check-in.
Option C: Bậc thang chỉ tiêu (Target-based / Tiered)
Mô tả: Công ty giao chỉ tiêu (Quota) hàng tháng. Nếu Sales đạt < 80% chỉ tiêu (không có hoa hồng), 80-100% (hoa hồng X%), vượt 100% (hoa hồng Y% + thưởng nóng).
Ưu điểm: Kích thích Sales chạy số mạnh mẽ vào cuối tháng, nhưng hệ thống tính toán (engine) sẽ phức tạp hơn.
(Lưu ý: Nếu bạn có cách tính đặc thù kết hợp nhiều phương án, cứ thoải mái chia sẻ nhé!) Bạn ưu tiên phương án nào?

Prompt: Tôi chọn Option B và C

Output:
Câu hỏi 4: Cấu trúc quản lý đội Sales của bạn được tổ chức theo cấp bậc như thế nào?
Việc này sẽ quyết định ai có quyền xem Dashboard và báo cáo của ai trên hệ thống.

Option A: Cấu trúc Phẳng (Flat)
Mô tả: Chỉ có 2 Role: Admin (Giám đốc/Kế toán xem toàn bộ) và Sales (Chỉ xem dữ liệu của chính mình).
Option B: Cấu trúc 2 cấp (Team-based)
Mô tả: Admin -> Trưởng nhóm (Sales Manager/Leader) -> Nhân viên Sales. Trưởng nhóm có Dashboard riêng để theo dõi KPI, doanh số và lộ trình đi tuyến của các Sales trong team mình quản lý.
Option C: Cấu trúc Đa phân lớp theo Địa lý (Regional-based)
Mô tả: Admin -> Quản lý Vùng (Miền Bắc/Trung/Nam) -> Quản lý Tỉnh/Khu vực -> Nhân viên Sales. Quyền hạn và Data Visibility (khả năng xem dữ liệu) được chia tách nghiêm ngặt theo giới hạn ranh giới địa lý.
Đội ngũ của bạn hiện tại (và dự kiến mở rộng trong tương lai gần) phù hợp với Option nào nhất?

Prompt: Tôi chọn Option B

Output:
❓ Câu hỏi 5: Định hướng nền tảng (Platform) cho hệ thống này là gì?
Mặc dù Sales là người lên đơn hộ Đại lý (như đã chốt ở Câu 2), Đại lý có cần một công cụ nào đó để tương tác ngược lại không?

Option A: Nội bộ hóa hoàn toàn (Chỉ Admin & Sales có App)
Mô tả: Xây dựng Web Admin cho (Admin + Sales Leader) và Mobile App (iOS/Android) cho Sales đi thị trường. Đại lý không có tài khoản hệ thống, họ chỉ nhận thông báo qua SMS hoặc hóa đơn giấy/Zalo cá nhân.
Ưu điểm: Tiết kiệm chi phí và thời gian phát triển, MVP ra mắt cực kỳ nhanh.
Option B: Hệ sinh thái mở rộng (Thêm cổng thông tin cho Đại lý)
Mô tả: Bao gồm Web Admin, Mobile App cho Sales, CỘNG THÊM một Zalo Mini App (hoặc Web Portal đơn giản) cấp tài khoản cho Đại lý. Đại lý vào đó để xem: Lịch sử đơn hàng, Công nợ hiện tại, Chương trình khuyến mãi.
Ưu điểm: Chuyên nghiệp, tăng sự gắn kết với Đại lý, minh bạch công nợ. Phù hợp định hướng phát triển lâu dài.
Option C: Tiết kiệm tối đa (PWA - Chỉ dùng nền tảng Web)
Mô tả: Không code Mobile App mà dùng Web Responsive (PWA) cho tất cả mọi người.
Ưu điểm/Nhược điểm: Chi phí rẻ nhất, nhưng trải nghiệm Check-in GPS, chụp ảnh Offline, tốc độ load cho Sales khi đi thị trường (mạng yếu) sẽ khá tệ. Không khuyến nghị cho hệ thống Tracking thị trường.
Bạn muốn khởi đầu dự án (MVP) với Option nào?

Prompt: Tôi chọn Option C

Output:
❓ Câu hỏi 6: Hệ thống quản lý Thanh toán và Công nợ của Đại lý như thế nào?
Option A: Tiền mặt/Thanh toán 100% ngay (Không quản lý công nợ)
Mô tả: Mua đứt bán đoạn. Đơn hàng chỉ có trạng thái "Chưa thanh toán" và "Đã thanh toán". Sales giao hàng và thu tiền luôn.
Ưu điểm: Database cực kỳ đơn giản.
Option B: Quản lý Hạn mức nợ (Credit Limit) và Thanh toán từng phần
Mô tả: Mỗi Đại lý được cấp một "Hạn mức nợ" (VD: 50 triệu). Sales lên đơn, hệ thống cộng dồn vào công nợ. Đại lý có thể trả dần (thanh toán từng phần). Hệ thống chặn không cho lên đơn nếu Đại lý vượt quá hạn mức nợ.
Ưu điểm: Sát với thực tế ngành bán buôn/FMCG nhất, hạn chế rủi ro nợ xấu.
Option C: Mini-ERP (Quản lý Phiếu Thu/Chi chi tiết)
Mô tả: Bất kỳ dòng tiền nào ra/vào đều phải lập "Phiếu Thu", "Phiếu Chi". Có đối soát công nợ đầu kỳ, cuối kỳ, xuất file Excel chốt công nợ hàng tháng gửi Đại lý.
Ưu điểm: Chặt chẽ tuyệt đối, phục vụ tốt cho bộ phận Kế toán. (Nhược điểm: Làm MVP sẽ lâu hơn).
Bạn muốn áp dụng mô hình quản lý dòng tiền nào?

Prompt: Tôi chọn Option B

Output:
❓ Câu hỏi 7: Hệ thống Thông báo (Notification) nên dùng kênh nào?
Vì hệ thống của chúng ta là Web App (PWA), người dùng có thể không nhận được Push Notification (thông báo nổi trên điện thoại) mượt mà như Native App. Vậy khi có Đơn hàng mới, Duyệt công nợ, hoặc Cảnh báo KPI, hệ thống nên báo qua đâu?

Option A: Chỉ dùng chuông thông báo (In-app Notification) trên Web
Mô tả: Người dùng phải đăng nhập và mở trình duyệt web lên thì mới thấy dấu chấm đỏ ở quả chuông.
Ưu điểm: Dễ làm nhất, không tốn chi phí bên thứ 3. Nhược điểm: Tính thời gian thực không cao nếu họ tắt web.
Option B: Tích hợp nhắn tin qua Zalo (Zalo ZNS) hoặc Telegram Bot
Mô tả: Bắn tin nhắn tự động thẳng vào Zalo hoặc Telegram của Admin, Sales Leader và Sales. (Ví dụ: "Sếp ơi, Sales Nguyễn Văn A vừa mở thêm 1 Đại lý mới!").
Ưu điểm: Độ tiếp cận (open rate) gần như 100%, xử lý công việc cực kỳ tức thời. Rất hợp với văn hóa làm việc tại VN.
Option C: Gửi Email tự động
Mô tả: Các thông báo quan trọng sẽ được gửi qua Email đăng ký.
Ưu điểm: Truyền thống, trang trọng. Phù hợp báo cáo chốt tháng, nhưng không hợp để báo real-time khi đi thị trường.
Bạn thích Option nào (hoặc có thể chọn kết hợp)? Trả lời xong câu này, tôi sẽ xuất bản thảo thiết kế hệ thống (System Design) cho bạn ngay!

Prompt: Tôi chọn Option C

Prompt: Dựa trên System Blueprint đã thống nhất trước đó, hãy đóng vai Senior Solution Architect + Lead Engineer để tạo kế hoạch triển khai (implementation plan) chi tiết cho toàn bộ hệ thống.

Mục tiêu:

Build MVP production-ready
Chạy hoàn chỉnh trên local bằng Docker
Kiến trúc clean, scalable, maintainable
Ưu tiên developer experience tốt

Prompt: Implement phase 1 và phase 2 theo bản kế hoạch đề ra

Prompt: Trước khi bắt đầu code phase 3, tôi muốn thực hiện một vòng Architecture Review cho database schema trước. Hãy đóng vai Senior Backend Architect và review toàn bộ file: backend/prisma/schema.prisma. Mục tiêu: Đảm bảo schema production-ready, Chuẩn hóa relation trước khi implement business logic, Tối ưu cho scalability, maintainability và query performance

Prompt: Implement Phase 3 và tiến hành kiểm thử bao gồm: Unit Tests, Integration Tests, E2E Tests, RBAC Tests, Transaction Tests, Concurrency Tests, Financial Consistency Tests

Prompt:  Tiến hành code tiếp RBAC Middleware + API Router (Controllers) và test Integration cho chúng. đảm bảo mọi api hoạt động chính xác

Prompt: Code Phase 5 trước, rồi quay lại BullMQ ở Phase 4 sau.

Prompt: Giờ hãy Hoàn thiện phase 4 và kiểm thử chức năng liên quan.

Prompt: Chạy frontend và back end cho tôi, tạo bộ test kiểm tra tất cả các lời gọi api từ frontend tới backend.

Prompt: Dựa trên toàn bộ architecture và business flow đã thống nhất trước đó, hãy implement bổ sung các tính năng “Xem chi tiết” và “Tạo mới” cho toàn bộ các module chính trong hệ thống. Mục tiêu: Không phá vỡ clean architecture hiện tại, Follow đúng RBAC và business rules, Production-ready, Maintainable, Consistent với coding standards trước đó

Prompt: Hãy thực hiện phase 6: Hoàn thiện & Dockerization cho Production

Prompt: Tạo file README.md hoàn chỉnh và trong đó có hướng dẫn chạy dự án cả local development và Docker deployment
