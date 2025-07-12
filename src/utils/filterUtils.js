// Utility functions for filtering tickets and generating filter options

export const getFilterOptions = (filterType, categories, tickets) => {
  if (!filterType) return [];

  if (filterType === "category") {
    return categories
      .filter((item) => item.e_type === "TASK")
      .map((cat) => ({ label: cat.name, value: cat.name }));
  }
  if (filterType === "subcategory") {
    return categories
      .filter((item) => item.e_type === "T_SUB")
      .map((sub) => ({ label: sub.name, value: sub.name }));
  }
  if (filterType === "status") {
    const uniqueStatuses = Array.from(new Set(tickets.map((t) => t.task_status)));
    return uniqueStatuses.map((status) => ({ label: status, value: status }));
  }
  if (filterType === "year") {
    const years = Array.from(
      new Set(
        tickets.map((t) => {
          let year;
          if (t.task_date) {
            const parts = t.task_date.split("-");
            year = parts.length === 3 ? parts[2] : new Date(t.createdAt).getFullYear().toString();
          } else {
            year = new Date(t.createdAt).getFullYear().toString();
          }
          return year;
        })
      )
    );
    return years.map((year) => ({ label: year.toString(), value: year.toString() }));
  }
  if (filterType === "month") {
    const months = [
      "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",
    ];
    return months.map((month, idx) => ({ label: month, value: (idx + 1).toString().padStart(2, "0") }));
  }
  return [];
};

export const filterTickets = (tickets, searchQuery, filterType, filterValue, searchKeys = ["remarks", "task_ref_id", "task_status"]) => {
  let filtered = [...tickets];
  if (searchQuery) {
    filtered = filtered.filter((item) =>
      searchKeys.some((key) => item[key]?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }
  if (filterType && filterValue) {
    if (filterType === "category") {
      filtered = filtered.filter((item) => item.task_category_name === filterValue);
    } else if (filterType === "subcategory") {
      filtered = filtered.filter((item) => item.task_sub_category_name === filterValue);
    } else if (filterType === "status") {
      filtered = filtered.filter((item) => item.task_status === filterValue);
    } else if (filterType === "year") {
      filtered = filtered.filter((item) => {
        let year;
        if (item.task_date) {
          const parts = item.task_date.split("-");
          year = parts.length === 3 ? parts[2] : new Date(item.createdAt).getFullYear().toString();
        } else {
          year = new Date(item.createdAt).getFullYear().toString();
        }
        return year === filterValue;
      });
    } else if (filterType === "month") {
      filtered = filtered.filter((item) => {
        let month;
        if (item.task_date) {
          const parts = item.task_date.split("-");
          month = parts.length === 3 ? parts[1] : (new Date(item.createdAt).getMonth() + 1).toString().padStart(2, "0");
        } else {
          month = (new Date(item.createdAt).getMonth() + 1).toString().padStart(2, "0");
        }
        return month === filterValue;
      });
    }
  }
  return filtered;
}; 