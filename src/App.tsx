// src/App.tsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import ModalLoading from './components/modal/ModalLoading';
import ModalLoading from './components/modal/ModalLoadingGIF';

// =======================
// Demo
// =======================
const Demo_Webhook_HelloWorld = lazy(() => import('./pages/demo/webhook/hello_world/Webhook'));
const Demo_Webhook_Product = lazy(() => import('./pages/demo/webhook/product/Webhook'));
const Demo_Webhook_Line = lazy(() => import('./pages/demo/webhook/line/Webhook'));
const Demo_Webhook_Line_ResponseURL = lazy(() => import('./pages/demo/webhook/line/ResponseURL'));

// =======================
// Public Pages
// =======================
const Home = lazy(() => import('./pages/home/Home'));
const Example = lazy(() => import('./pages/home/Example'));
const Menu = lazy(() => import('./pages/home/Menu'));
const Test = lazy(() => import('./pages/home/Test'));

// =======================
// User Pages
// =======================
const User_gallery_OnePage = lazy(() => import('./pages/role/user/gallery/GalleryOnePage'));
const User_gallery_Viewer = lazy(() => import('./pages/role/user/gallery/GalleryViewer'));
const User_gallery_Slider = lazy(() => import('./pages/role/user/gallery/GallerySlider'));
const User_gallery_GalleryLiveFeedVertical = lazy(() => import('./pages/role/user/gallery/GalleryLiveFeedVertical'));
const User_gallery_GalleryLiveFeedHorizontal = lazy(() => import('./pages/role/user/gallery/GalleryLiveFeedHorizontal'));
const User_gallery_GalleryViewerPattern = lazy(() => import('./pages/role/user/gallery/GalleryViewerPattern'));
const User_gallery_GenerateQRCode = lazy(() => import('./pages/role/user/gallery/GenerateQRCode'));
const User_person_FormPerson = lazy(() => import('./pages/role/user/persons/FormPerson'));
const User_company_FormCompany = lazy(() => import('./pages/role/user/companies/FormCompany'));
const User_promotion_Claim = lazy(() => import('./pages/role/user/promotion_code/Claim'));
const User_demo_VR360Viewer = lazy(() => import('./pages/role/user/demo/VR360Viewer'));
const User_demo_ARLocation = lazy(() => import('./pages/role/user/demo/ARLocation'));
const User_demo_MultiChannel = lazy(() => import('./pages/role/user/demo/MultiChannel'));
const User_demo_PhotoMobile = lazy(() => import('./pages/role/user/demo/PhotoMobile'));
const User_form_OpenHouse = lazy(() => import('./pages/role/user/form/OpenHouse'));
// inspirations: image
const User_inspiration_SelectInspirationImage = lazy(() => import('./pages/role/user/inspiration/SelectInspirationImage'));
const User_inspiration_SignaturePadImage = lazy(() => import('./pages/role/user/inspiration/SignaturePadImage'));
const User_inspiration_PreviewInspirationImage = lazy(() => import('./pages/role/user/inspiration/PreviewInspirationImage'));
// inspirations: viewer
const User_inspiration_viewer_InspirationViewer = lazy(() => import('./pages/role/user/inspiration/viewer/InspirationViewer'));
const User_inspiration_viewer_InspirationViewerAnimation = lazy(() => import('./pages/role/user/inspiration/viewer/InspirationViewerAnimation'));
// inspirations: upload
const InspirationUpload = lazy(() => import('./pages/role/user/inspiration/upload/InspirationUpload'));

// =======================
// Admin Pages
// =======================
const Admin_Login = lazy(() => import('./pages/role/admin/Login'));
const Admin_Register = lazy(() => import('./pages/role/admin/Register'));
const Admin_Dashboard = lazy(() => import('./pages/role/admin/Dashboard'));
const Admin_Profile = lazy(() => import('./pages/role/admin/Profile'));
const Admin_Setting = lazy(() => import('./pages/role/admin/Setting'));

// =======================
// Admin Reports
// =======================
const Admin_Report_Product = lazy(() => import('./pages/role/admin/reports/ReportProduct'));
const Admin_Report_Person = lazy(() => import('./pages/role/admin/reports/ReportPerson'));
const Admin_Report_PromotionCode = lazy(() => import('./pages/role/admin/reports/ReportPromotionCode'));
const Admin_Report_Analytics = lazy(() => import('./pages/role/admin/reports/ReportAnalytics'));

// =======================
// Admin Data - Product
// =======================
const Admin_Data_Product_Add = lazy(() => import('./pages/role/admin/data/product/Add'));
const Admin_Data_Product_Edit = lazy(() => import('./pages/role/admin/data/product/Edit'));
const Admin_Data_Product_List = lazy(() => import('./pages/role/admin/data/product/List'));
const Admin_Data_Product_View = lazy(() => import('./pages/role/admin/data/product/View'));

// =======================
// Admin Data - Company
// =======================
const Admin_Data_Company_Add = lazy(() => import('./pages/role/admin/data/company/Add'));
const Admin_Data_Company_Edit = lazy(() => import('./pages/role/admin/data/company/Edit'));
const Admin_Data_Company_List = lazy(() => import('./pages/role/admin/data/company/List'));
const Admin_Data_Company_View = lazy(() => import('./pages/role/admin/data/company/View'));

// =======================
// Admin Data - Person
// =======================
const Admin_Data_Person_Add = lazy(() => import('./pages/role/admin/data/person/Add'));
const Admin_Data_Person_Edit = lazy(() => import('./pages/role/admin/data/person/Edit'));
const Admin_Data_Person_List = lazy(() => import('./pages/role/admin/data/person/List'));
const Admin_Data_Person_View = lazy(() => import('./pages/role/admin/data/person/View'));

// =======================
// Admin Data - Promotion Code
// =======================
const Admin_Data_PromotionCode_Add = lazy(() => import('./pages/role/admin/data/promotion_code/Add'));
const Admin_Data_PromotionCode_Edit = lazy(() => import('./pages/role/admin/data/promotion_code/Edit'));
const Admin_Data_PromotionCode_List = lazy(() => import('./pages/role/admin/data/promotion_code/List'));
const Admin_Data_PromotionCode_View = lazy(() => import('./pages/role/admin/data/promotion_code/View'));

// =======================
// Admin Data - Gallery Manager
// =======================
const Admin_Data_gallery_manager_Main = lazy(() => import('./pages/role/admin/data/gallery_manager/Main'));

// =======================
// Module - ComfyUI Vista
// =======================
const Module_comfyui_vista_text_to_image_Page1 = lazy(() => import('./pages/module/comfyui/vista/text-to-image/Page1'));
const Module_comfyui_vista_image_to_image_Page1 = lazy(() => import('./pages/module/comfyui/vista/image-to-image/Page1'));
const Module_comfyui_vista_image_to_image_openpose_Page1 = lazy(() => import('./pages/module/comfyui/vista/image-to-image-openpose/Page1'));

// =======================
// Module - ComfyUI Onex
// =======================
const Module_comfyui_onex_anime_Page1 = lazy(() => import('./pages/module/comfyui/onex/anime/Page1'));
const Module_comfyui_onex_cartoon_Page1 = lazy(() => import('./pages/module/comfyui/onex/cartoon/Page1'));
const Module_comfyui_onex_disney_Page1 = lazy(() => import('./pages/module/comfyui/onex/disney/Page1'));
const Module_comfyui_onex_ghibli_Page1 = lazy(() => import('./pages/module/comfyui/onex/ghibli/Page1'));
const Module_comfyui_onex_painting_Page1 = lazy(() => import('./pages/module/comfyui/onex/painting/Page1'));
const Module_comfyui_onex_pixel_Page1 = lazy(() => import('./pages/module/comfyui/onex/pixel/Page1'));

// =======================
// Module - Capture
// =======================
const Module_capture_vip_photo_menu_Menu = lazy(() => import('./pages/module/capture/vip-photo/menu/Menu'));
const Module_capture_vip_photo_capture_Page1 = lazy(() => import('./pages/module/capture/vip-photo/capture/Page1'));
const Module_capture_photo_register_menu_Menu = lazy(() => import('./pages/module/capture/photo-register/menu/Menu'));
const Module_capture_photo_register_capture_Page1 = lazy(() => import('./pages/module/capture/photo-register/capture/Page1'));

// =======================
// SELFIE
// =======================
const User_selfie_Tutorial = React.lazy(() => import('./pages/role/user/selfie/Tutorial'));
const User_selfie_Camera   = React.lazy(() => import('./pages/role/user/selfie/Camera'));
const User_selfie_Preview  = React.lazy(() => import('./pages/role/user/selfie/Preview'));
const User_selfie_Summary  = React.lazy(() => import('./pages/role/user/selfie/Summary'));

// SELFIE_SERVICE
const User_selfie_service_Search = React.lazy(() => import('./pages/role/user/selfie/service/Search'));
const User_selfie_service_Result = React.lazy(() => import('./pages/role/user/selfie/service/Result'));

// =======================
// App Component
// =======================
const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
        <Suspense fallback={<ModalLoading />}>
          <Routes>
            {/* demo */}
            <Route path="/demo/webhook/hello_world/Webhook" element={<Demo_Webhook_HelloWorld />} />
            <Route path="/demo/webhook/product/Webhook" element={<Demo_Webhook_Product />} />
            
            <Route path="/demo/webhook/line/Webhook" element={<Demo_Webhook_Line />} />
            <Route path="/demo/webhook/line/ResponseURL" element={<Demo_Webhook_Line_ResponseURL />} />

            {/* public */}
            <Route path="/" element={<Home />} />

            <Route path="/home/Example" element={<Example />} />
            <Route path="/home/Menu" element={<Menu />} />
            <Route path="/home/Test" element={<Test />} />
            
            {/* user */}
            <Route path="/role/user/gallery/GalleryOnePage/:event_code/:qrcode" element={<User_gallery_OnePage />} />
            <Route path="/role/user/gallery/GalleryViewer/:event_code" element={<User_gallery_Viewer />} />
            <Route path="/role/user/gallery/GallerySlider/:event_code" element={<User_gallery_Slider />} />
            <Route path="/role/user/gallery/GalleryLiveFeedVertical/:event_code" element={<User_gallery_GalleryLiveFeedVertical />} />
            <Route path="/role/user/gallery/GalleryLiveFeedHorizontal/:event_code" element={<User_gallery_GalleryLiveFeedHorizontal />} />
            <Route path="/role/user/gallery/GalleryViewerPattern/:event_code" element={<User_gallery_GalleryViewerPattern />} />
            <Route path="/role/user/gallery/GenerateQRCode" element={<User_gallery_GenerateQRCode />} />
            <Route path="/role/user/persons/FormPerson" element={<User_person_FormPerson />} />
            <Route path="/role/user/companies/FormCompany" element={<User_company_FormCompany />} />
            <Route path="/role/user/demo/VR360Viewer" element={<User_demo_VR360Viewer />} />
            <Route path="/role/user/demo/ARLocation" element={<User_demo_ARLocation />} />
            <Route path="/role/user/demo/MultiChannel/:videoId" element={<User_demo_MultiChannel />} />
            <Route path="/role/user/demo/PhotoMobile" element={<User_demo_PhotoMobile />} />
            <Route path="/role/user/promotion_code/Claim" element={<User_promotion_Claim />} />
            <Route path="/role/user/form/OpenHouse" element={<User_form_OpenHouse />} />
            {/* inspirations: image */}
            <Route path="/role/user/inspiration/SelectInspirationImage" element={<User_inspiration_SelectInspirationImage />} />
            <Route path="/role/user/inspiration/SignaturePadImage" element={<User_inspiration_SignaturePadImage />} />
            <Route path="/role/user/inspiration/PreviewInspirationImage" element={<User_inspiration_PreviewInspirationImage />} />
            {/* inspirations: viewer */}
            <Route path="/role/user/inspiration/viewer/InspirationViewer/:event_code" element={<User_inspiration_viewer_InspirationViewer />} />
            <Route path="/role/user/inspiration/viewer/InspirationViewerAnimation/:event_code" element={<User_inspiration_viewer_InspirationViewerAnimation />} />
            {/* inspirations: upload */}
            <Route path="/role/user/inspiration/upload/InspirationUpload" element={<InspirationUpload />} />

            {/* admin */}
            <Route path="/role/admin/Login" element={<Admin_Login />} />
            {/* <Route path="/role/admin/Register" element={<Admin_Register />} /> */}
            <Route path="/role/admin/Dashboard" element={<Admin_Dashboard />} />
            <Route path="/role/admin/Profile" element={<Admin_Profile />} />
            <Route path="/role/admin/Setting" element={<Admin_Setting />} />
            
            {/* data */}
            <Route path="/role/admin/data/product/Add" element={<Admin_Data_Product_Add />} />
            <Route path="/role/admin/data/product/Edit/:id" element={<Admin_Data_Product_Edit />} />
            <Route path="/role/admin/data/product/List" element={<Admin_Data_Product_List />} />
            <Route path="/role/admin/data/product/View/:id" element={<Admin_Data_Product_View />} />

            <Route path="/role/admin/data/company/Add" element={<Admin_Data_Company_Add />} />
            <Route path="/role/admin/data/company/Edit/:id" element={<Admin_Data_Company_Edit />} />
            <Route path="/role/admin/data/company/List" element={<Admin_Data_Company_List />} />
            <Route path="/role/admin/data/company/View/:id" element={<Admin_Data_Company_View />} />

            <Route path="/role/admin/data/person/Add" element={<Admin_Data_Person_Add />} />
            <Route path="/role/admin/data/person/Edit/:id" element={<Admin_Data_Person_Edit />} />
            <Route path="/role/admin/data/person/List" element={<Admin_Data_Person_List />} />
            <Route path="/role/admin/data/person/View/:id" element={<Admin_Data_Person_View />} />

            <Route path="/role/admin/data/promotion_code/Add" element={<Admin_Data_PromotionCode_Add />} />
            <Route path="/role/admin/data/promotion_code/Edit/:id" element={<Admin_Data_PromotionCode_Edit />} />
            <Route path="/role/admin/data/promotion_code/List" element={<Admin_Data_PromotionCode_List />} />
            <Route path="/role/admin/data/promotion_code/View/:id" element={<Admin_Data_PromotionCode_View />} />

            <Route path="/role/admin/data/gallery_manager/Main" element={<Admin_Data_gallery_manager_Main />} />
            
            {/* report */}
            <Route path="/role/admin/reports/ReportProduct" element={<Admin_Report_Product />} />
            <Route path="/role/admin/reports/ReportPerson" element={<Admin_Report_Person />} />
            <Route path="/role/admin/reports/ReportPromotionCode" element={<Admin_Report_PromotionCode />} />
            <Route path="/role/admin/reports/ReportAnalytics" element={<Admin_Report_Analytics />} />
            
            {/* module */}
            {/* vista */}
            <Route path="/module/comfyui/vista/text-to-image/Page1" element={<Module_comfyui_vista_text_to_image_Page1 />} />
            <Route path="/module/comfyui/vista/image-to-image/Page1" element={<Module_comfyui_vista_image_to_image_Page1 />} />
            <Route path="/module/comfyui/vista/image-to-image-openpose/Page1" element={<Module_comfyui_vista_image_to_image_openpose_Page1 />} />
            
            {/* onex */}
            <Route path="/module/comfyui/onex/anime/Page1" element={<Module_comfyui_onex_anime_Page1 />} />
            <Route path="/module/comfyui/onex/cartoon/Page1" element={<Module_comfyui_onex_cartoon_Page1 />} />
            <Route path="/module/comfyui/onex/disney/Page1" element={<Module_comfyui_onex_disney_Page1 />} />
            <Route path="/module/comfyui/onex/ghibli/Page1" element={<Module_comfyui_onex_ghibli_Page1 />} />
            <Route path="/module/comfyui/onex/painting/Page1" element={<Module_comfyui_onex_painting_Page1 />} />
            <Route path="/module/comfyui/onex/pixel/Page1" element={<Module_comfyui_onex_pixel_Page1 />} />
            
            {/* capture */}
            <Route path="/module/capture/vip-photo/menu/Menu" element={<Module_capture_vip_photo_menu_Menu />} />
            <Route path="/module/capture/vip-photo/capture/Page1" element={<Module_capture_vip_photo_capture_Page1 />} />
            <Route path="/module/capture/photo-register/menu/Menu" element={<Module_capture_photo_register_menu_Menu />} />
            <Route path="/module/capture/photo-register/capture/Page1" element={<Module_capture_photo_register_capture_Page1 />} />
          
            {/* SELFIE */}
            <Route path="/role/user/selfie/tutorial/:station" element={<User_selfie_Tutorial />} />
            <Route path="/role/user/selfie/camera/:station" element={<User_selfie_Camera />} />
            <Route path="/role/user/selfie/preview/:station" element={<User_selfie_Preview />} />
            <Route path="/role/user/selfie/summary/:station" element={<User_selfie_Summary />} />
            {/* SELFIE_SERVICE */}
            <Route path="/role/user/selfie/service/search" element={<User_selfie_service_Search />} />
            <Route path="/role/user/selfie/service/result" element={<User_selfie_service_Result />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
};

export default App;
