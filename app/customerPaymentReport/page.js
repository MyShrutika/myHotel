"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import * as XLSX from "xlsx";
const CustomerPaymentReport = () => {
  const [customers, setCustomers] = useState([]);
  const currentDate = new Date().toISOString().split("T")[0]; // Get the current date in "YYYY-MM-DD" format
  const [startDate, setStartDate] = useState(currentDate);
  const [endDate, setEndDate] = useState(currentDate);

  const fetchDatewiseRecords = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/customer/datewiseRecords?startDate=${startDate}&endDate=${endDate}`
      );
      console.log(response.data);
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching date-wise records:", error);
    }
  };
  const exportToExcel = () => {
    // Define the sheet data
    const sheetData = customers.map((customer, index) => [
      index + 1,
      customer.dateWiseRecords.length > 0
        ? new Date(customer.dateWiseRecords[0].date).toLocaleDateString("en-GB")
        : "",
      customer.customerName,
      customer.mobileNumber,
      customer.creditBalance,
      customer.debit,
      customer.balance,
      // Add additional columns as needed
    ]);

    // Create a worksheet
    const ws = XLSX.utils.aoa_to_sheet([
      [
        "Sr",
        "Date",
        "Name",
        "Mobile Number",
        "Credit Balance",
        "Debit Balance",
        "Balance",
      ],
      ...sheetData,
    ]);

    // Create a workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customer Data");

    // Save the workbook as an Excel file
    XLSX.writeFile(wb, "customer_data.xlsx");
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchDatewiseRecords();
    }
  }, [startDate, endDate]);

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/customer/customers"
      );
      console.log(response.data);
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <>
      <Navbar />
      <div className=" mt-12 mx-auto">
        <h1 className="text-2xl font-bold mb-4 ml-2">Customer Payment Report</h1>

        {/* Date Input Fields */}
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 my-4 ml-4">
          <div>
            <label htmlFor="startDate" className="mr-2 text-gray-600">Start Date</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={handleStartDateChange}
              className="border rounded-md p-2 text-gray-700 mb-2 sm:mb-0 md:text-sm text-sm lg:w-md"
              />
          </div>
          <div>
            <label htmlFor="endDate" className="mx-2 text-gray-600">End Date</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={handleEndDateChange}
              className="border rounded-md p-2 text-gray-700 mb-2 sm:mb-0 md:text-sm text-sm"
              />
            <button
              className="text-orange-600 font-bold py-1 ml-4 rounded-full bg-orange-100 mr-2 px-2 shadow-md md:text-base text-sm"
              onClick={exportToExcel}
            >
              Export to Excel
            </button>
          </div>
        </div>

        {/* Customer Table */}
        <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 text-left align-middle">
        <thead className="bg-gray-200">
              <tr className="text-center align-middle bg-gray-200 text-yellow-700 md:text-base text-sm">
                <th className="border p-2">Sr</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Time</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Mobile Number</th>
                <th className="border p-2">Credit Balance</th>
                <th className="border p-2">Debit Balance</th>
                <th className="border p-2">Balance</th>
                {/* Add additional columns as needed */}
              </tr>
            </thead>

            <tbody>
              {customers.map((customer, index) => (
                <tr key={customer._id}>
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2">
                    {customer.dateWiseRecords.length > 0
                      ? new Date(
                        customer.dateWiseRecords[0].date
                      ).toLocaleDateString("en-GB")
                      : ""}
                  </td>
                  <td className="border p-2">
                    {customer.dateWiseRecords.length > 0 && (
                      <tr key={`${customer._id}-debit-details`}>
                        <td colSpan="8">
                          <table className="border-collapse border border-gray-300 min-w-full divide-y divide-gray-200">
                            <thead>
                              <tr>
                                <th className="border p-2">Date</th>
                                <th className="border p-2">Time</th>
                                <th className="border p-2">Debit Amount</th>
                              </tr>
                            </thead>

                            <tbody>
                              {customer.dateWiseRecords.map(
                                (record, recordIndex) => (
                                  <tr
                                    key={`${customer._id}-debit-details-${recordIndex}`}
                                  >
                                    <td className="border p-2">
                                      {new Date(record.date).toLocaleDateString(
                                        "en-GB"
                                      )}
                                    </td>
                                    <td className="border p-2">
                                      {new Date(record.date).toLocaleTimeString(
                                        "en-US",
                                        {
                                          hour: "numeric",
                                          minute: "numeric",
                                          second: "numeric",
                                        }
                                      )}
                                    </td>
                                    <td className="border p-2">{record.debit}</td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </td>

                  <td className="border p-2">{customer.customerName}</td>
                  <td className="border p-2">{customer.mobileNumber}</td>
                  {/* Display the date from the first dateWiseRecord, you might want to modify this logic based on your use case */}
                  <td className="border p-2">{customer.creditBalance}</td>
                  <td className="border p-2">{customer.debit}</td>

                  <td className="border p-2">{customer.balance} </td>
                  {/* Add additional columns as needed */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default CustomerPaymentReport;