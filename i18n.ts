export type Lang = 'ar' | 'en';

export type TranslationKey = {
  appName: string;
  login: {
    title: string;
    username: string;
    usernamePlaceholder: string;
    role: string;
    regularUser: string;
    admin: string;
    password: string;
    passwordPlaceholder: string;
    loginButton: string;
    errorPassword: string;
    errorUsername: string;
    welcomeUser: string;
    welcomeAdmin: string;
  };
  nav: {
    room: string;
    warehouse: string;
    activityLog: string;
    logout: string;
  };
  items: {
    addItem: string;
    editItem: string;
    deleteItem: string;
    title: string;
    description: string;
    quantity: string;
    imageUrl: string;
    save: string;
    cancel: string;
    decrease: string;
    restore: string;
    noItems: string;
    titlePlaceholder: string;
    descriptionPlaceholder: string;
    imageUrlPlaceholder: string;
    uploadImage: string;
    changeImage: string;
    removeImage: string;
    confirmDelete: string;
    noRestoreAvailable: string;
    moveItem: string;
    moveToRoom: string;
    moveToWarehouse: string;
    confirmMove: string;
  };
  activityLog: {
    title: string;
    item: string;
    action: string;
    user: string;
    date: string;
    time: string;
    details: string;
    noLogs: string;
    actions: {
      add: string;
      edit: string;
      delete: string;
      decrease: string;
      restore: string;
      move: string;
    };
  };
  notifications: {
    itemAdded: string;
    itemOutOfStockRoom: string;
    lowStock: string;
    aboutToRunOut: string;
  };
  common: {
    close: string;
    search: string;
    noResults: string;
    from: string;
    to: string;
    changedFrom: string;
    toText: string;
  };
};

export const translations: Record<Lang, TranslationKey> = {
  ar: {
    appName: 'لوجستي المركز',
    login: {
      title: 'تسجيل الدخول',
      username: 'اسم المستخدم',
      usernamePlaceholder: 'أدخل اسم المستخدم',
      role: 'الدور',
      regularUser: 'مستخدم عادي',
      admin: 'مشرف',
      password: 'كلمة المرور',
      passwordPlaceholder: 'أدخل كلمة المرور',
      loginButton: 'دخول',
      errorPassword: 'كلمة المرور غير صحيحة',
      errorUsername: 'الرجاء إدخال اسم المستخدم',
      welcomeUser: 'أهلاً أخ',
      welcomeAdmin: 'أهلاً باللوجستي...نورت',
    },
    nav: {
      room: 'الغرفة',
      warehouse: 'المستودع',
      activityLog: 'سجل النشاط',
      logout: 'تسجيل الخروج',
    },
    items: {
      addItem: 'إضافة صنف',
      editItem: 'تعديل الصنف',
      deleteItem: 'حذف',
      title: 'اسم الصنف',
      description: 'الوصف',
      quantity: 'الكمية',
      imageUrl: 'صورة الصنف',
      save: 'حفظ',
      cancel: 'إلغاء',
      decrease: 'إنقاص',
      restore: 'تراجع',
      noItems: 'لا توجد أصناف',
      titlePlaceholder: 'اسم الصنف',
      descriptionPlaceholder: 'وصف الصنف',
      imageUrlPlaceholder: 'اختر صورة من جهازك',
      uploadImage: 'رفع صورة',
      changeImage: 'تغيير الصورة',
      removeImage: 'إزالة الصورة',
      confirmDelete: 'هل أنت متأكد من حذف هذا الصنف؟',
      noRestoreAvailable: 'لا يوجد إنقاص للتراجع عنه',
      moveItem: 'نقل',
      moveToRoom: 'نقل إلى الغرفة',
      moveToWarehouse: 'نقل إلى المستودع',
      confirmMove: 'هل تريد نقل هذا الصنف؟',
    },
    activityLog: {
      title: 'سجل النشاط',
      item: 'الصنف',
      action: 'العملية',
      user: 'المستخدم',
      date: 'التاريخ',
      time: 'الوقت',
      details: 'التفاصيل',
      noLogs: 'لا يوجد نشاط',
      actions: {
        add: 'إضافة',
        edit: 'تعديل',
        delete: 'حذف',
        decrease: 'إنقاص',
        restore: 'تراجع',
        move: 'نقل',
      },
    },
    notifications: {
      itemAdded: 'تم اضافة الصنف',
      itemOutOfStockRoom: 'تنبيه: لم يعد لدينا في الغرفة الصنف',
      lowStock: 'تحذير الصنف',
      aboutToRunOut: 'على وشك النفاذ !',
    },
    common: {
      close: 'إغلاق',
      search: 'بحث',
      noResults: 'لا توجد نتائج',
      from: 'من',
      to: 'إلى',
      changedFrom: 'تم تغيير الكمية من',
      toText: 'إلى',
    },
  },
  en: {
    appName: 'Center Logistic',
    login: {
      title: 'Login',
      username: 'Username',
      usernamePlaceholder: 'Enter username',
      role: 'Role',
      regularUser: 'Regular User',
      admin: 'Admin',
      password: 'Password',
      passwordPlaceholder: 'Enter password',
      loginButton: 'Login',
      errorPassword: 'Incorrect password',
      errorUsername: 'Please enter a username',
      welcomeUser: 'Welcome brother',
      welcomeAdmin: 'Welcome to logistics... glad to have you',
    },
    nav: {
      room: 'Room',
      warehouse: 'Warehouse',
      activityLog: 'Activity Log',
      logout: 'Logout',
    },
    items: {
      addItem: 'Add Item',
      editItem: 'Edit Item',
      deleteItem: 'Delete',
      title: 'Item Name',
      description: 'Description',
      quantity: 'Quantity',
      imageUrl: 'Item Image',
      save: 'Save',
      cancel: 'Cancel',
      decrease: 'Decrease',
      restore: 'Restore',
      noItems: 'No items',
      titlePlaceholder: 'Item name',
      descriptionPlaceholder: 'Item description',
      imageUrlPlaceholder: 'Choose an image from your device',
      uploadImage: 'Upload Image',
      changeImage: 'Change Image',
      removeImage: 'Remove Image',
      confirmDelete: 'Are you sure you want to delete this item?',
      noRestoreAvailable: 'No recent decrease to restore',
      moveItem: 'Move',
      moveToRoom: 'Move to Room',
      moveToWarehouse: 'Move to Warehouse',
      confirmMove: 'Do you want to move this item?',
    },
    activityLog: {
      title: 'Activity Log',
      item: 'Item',
      action: 'Action',
      user: 'User',
      date: 'Date',
      time: 'Time',
      details: 'Details',
      noLogs: 'No activity',
      actions: {
        add: 'Added',
        edit: 'Edited',
        delete: 'Deleted',
        decrease: 'Decreased',
        restore: 'Restored',
        move: 'Moved',
      },
    },
    notifications: {
      itemAdded: 'Item added',
      itemOutOfStockRoom: 'Alert: We no longer have',
      lowStock: 'Warning',
      aboutToRunOut: 'is about to run out!',
    },
    common: {
      close: 'Close',
      search: 'Search',
      noResults: 'No results',
      from: 'from',
      to: 'to',
      changedFrom: 'Quantity changed from',
      toText: 'to',
    },
  },
};
