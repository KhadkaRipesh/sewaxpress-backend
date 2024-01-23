interface IEmailData {
  name: string;
  title: string;
  message: string;
}

interface IBookingData {
  title: string;
  message: string;
  name: string;
  service_name: any;
  service_category: any;
  cost: number;
  email: string;
  phone: string;
  address: string;
  date: Date;
}

export function defaultMailTemplate(data: IEmailData) {
  return `<!DOCTYPE html>
        <html>
        <head>
            <title>${data.title}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f2f2f2;
                    padding: 20px;
                }
                
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 30px;
                    border-radius: 5px;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }
                
                h1 {
                    color: #333333;
                }
                
                p {
                    color: #555555;
                    margin-bottom: 20px;
                }
                
                .details {
                    background-color: #f7f7f7;
                    padding: 15px;
                    border-radius: 5px;
                }
                
                .details p {
                    margin: 0;
                }
                
                .bold {
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>${data.title}</h1>
                <p>Dear <span class="bold">${data.name}</span>,</p>
                <p>Thank you for using sewaXpress.</p>
                
                <div class="details">
                    ${data.message}
                </div>
                
                <p>If you have any questions or need further assistance, please feel free to contact our customer service.</p>
                
            </div>
        </body>
        </html>`;
}

export function bookingMailTemplate(data: IBookingData) {
  return `<!DOCTYPE html>
  <html>
    <head>
      <title>${data.title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f2f2f2;
          padding: 20px;
        }
  
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 30px;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
  
        h1 {
          color: #333333;
        }
  
        p {
          color: #555555;
          margin-bottom: 20px;
        }
  
        .details {
          background-color: #f7f7f7;
          padding: 15px;
          border-radius: 5px;
        }
  
        .details p {
          margin: 0;
        }
  
        .bold {
          font-weight: bold;
        }
  
        table {
          margin: 10px auto;
          border-collapse: collapse;
          width: 80%;
          /* margin: 0 auto; */
        }
  
        th,
        td {
          border: 1px solid #dddddd;
          text-align: left;
          padding: 8px;
        }
  
        th {
          background-color: #efefef;
          width: 40%;
        }
  
        tr:hover {
          background-color: #f5f5f5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${data.title}</h1>
        <p>Dear <span class="bold">${data.name}</span>,</p>
        <p>${data.message}</p>
  
        <div class="details">
          The details of the booking is here:
          <table>
            <tr>
              <th>Service Name</th>
              <td>${data.service_name}</td>
            </tr>
            <tr>
              <th>Service Category</th>
              <td>${data.service_category}</td>
            </tr>
            <tr>
              <th>Estimated Cost</th>
              <td>${data.cost}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td>${data.email}</td>
            </tr>
            <tr>
              <th>Phone</th>
              <td>${data.phone}</td>
            </tr>
            <tr>
              <th>Booking Address</th>
              <td>${data.address}</td>
            </tr>
            <tr>
              <th>Booking Date</th>
              <td>${data.date}</td>
            </tr>
          </table>
        </div>
        <p>
          If you have any questions or need further assistance, please feel free
          to contact our customer service.
        </p>
      </div>
    </body>
  </html>
  `;
}
