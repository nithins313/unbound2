#!/usr/bin/env python3
"""
Unbound CLI - Command Line Interface for Unbound API
Usage: python main.py --api-key YOUR_API_KEY
"""

import argparse
import requests
import sys
from typing import Optional

BASE_URL = "http://localhost:3000"


class UnboundCLI:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.headers = {"Authorization": f"Bearer {api_key}"}

    def _request(self, method: str, endpoint: str, data: Optional[dict] = None):
        """Make HTTP request to the API"""
        url = f"{BASE_URL}{endpoint}"
        try:
            if method == "GET":
                response = requests.get(url, headers=self.headers)
            elif method == "POST":
                response = requests.post(url, headers=self.headers, json=data)
            elif method == "PUT":
                response = requests.put(url, headers=self.headers, json=data)
            elif method == "DELETE":
                response = requests.delete(url, headers=self.headers)
            else:
                print(f"❌ Unknown method: {method}")
                return None

            return response.json()
        except requests.exceptions.ConnectionError:
            print("❌ Error: Could not connect to the server. Is it running?")
            return None
        except Exception as e:
            print(f"❌ Error: {e}")
            return None

    # ==================== USER COMMANDS ====================
    def execute_command(self, command: str):
        """Execute a command"""
        result = self._request("POST", "/user/execute-command", {"command": command})
        if result:
            print(f"\n📋 Result: {result.get('status', 'Unknown')}")
            print(f"   Message: {result.get('message', '')}")

    def get_credits(self):
        """Get current credit balance"""
        result = self._request("GET", "/user/credits")
        if result:
            print(f"\n💰 Credits: {result.get('credits', 0)}")

    def get_history(self):
        """Get command history"""
        result = self._request("GET", "/user/history")
        if result:
            history = result.get("history", [])
            print(f"\n📜 Command History ({len(history)} entries):")
            print("-" * 60)
            for log in history:
                print(f"  ID: {log.get('id')} | Action: {log.get('action')} | Command: {log.get('comment')}")

    # ==================== ADMIN COMMANDS ====================
    def get_dashboard(self):
        """Get admin dashboard"""
        result = self._request("GET", "/admin/dashboard")
        if result:
            print(f"\n📊 Dashboard: {result.get('message', '')}")

    def create_user(self, mail: str, name: str, phone: str, user_type: str):
        """Create a new user"""
        data = {"mail": mail, "name": name, "phone": phone, "userType": user_type}
        result = self._request("POST", "/admin/create-user", data)
        if result:
            print(f"\n✅ {result.get('message', 'User created')}")
            if result.get("apiKey"):
                print(f"   API Key: {result.get('apiKey')}")

    def delete_user(self, user_id: int):
        """Delete a user"""
        result = self._request("DELETE", f"/admin/delete-user/{user_id}")
        if result:
            print(f"\n🗑️  {result.get('message', 'User deleted')}")

    def update_user(self, user_id: int, name: Optional[str] = None, phone: Optional[str] = None,
                    user_type: Optional[str] = None, credits: Optional[int] = None):
        """Update a user"""
        data = {}
        if name:
            data["name"] = name
        if phone:
            data["phone"] = phone
        if user_type:
            data["userType"] = user_type
        if credits is not None:
            data["credits"] = credits
        result = self._request("PUT", f"/admin/update-user/{user_id}", data)
        if result:
            print(f"\n✏️  {result.get('message', 'User updated')}")

    def get_users(self):
        """Get all users"""
        result = self._request("GET", "/admin/get-users")
        if result:
            users = result.get("users", [])
            print(f"\n👥 Users ({len(users)} total):")
            print("-" * 80)
            for user in users:
                print(f"  ID: {user.get('id')} | Name: {user.get('name')} | Email: {user.get('mail')} | Type: {user.get('userType')} | Credits: {user.get('credit', 0)}")

    def create_rule(self, pattern: str, action: str):
        """Create a new rule"""
        data = {"pattern": pattern, "action": action}
        result = self._request("POST", "/admin/create-rule", data)
        if result:
            print(f"\n✅ {result.get('message', 'Rule created')}")

    def delete_rule(self, rule_id: int):
        """Delete a rule"""
        result = self._request("DELETE", f"/admin/delete-rule/{rule_id}")
        if result:
            print(f"\n🗑️  {result.get('message', 'Rule deleted')}")

    def get_rules(self):
        """Get all rules"""
        result = self._request("GET", "/admin/get-rules")
        if result:
            rules = result.get("rules", [])
            print(f"\n📏 Rules ({len(rules)} total):")
            print("-" * 60)
            for rule in rules:
                print(f"  ID: {rule.get('id')} | Pattern: {rule.get('pattern')} | Action: {rule.get('action')}")

    def get_logs(self):
        """Get all logs (admin)"""
        result = self._request("GET", "/admin/get-logs")
        if result:
            logs = result.get("logs", [])
            print(f"\n📝 Logs ({len(logs)} total):")
            print("-" * 60)
            for log in logs:
                print(f"  ID: {log.get('id')} | User: {log.get('userid')} | Action: {log.get('action')} | Command: {log.get('comment')}")

    # ==================== ROLE MANAGEMENT ====================
    def create_role(self, name: str, description: str):
        """Create a new role"""
        data = {"name": name, "description": description}
        result = self._request("POST", "/admin/create-role", data)
        if result:
            print(f"\n✅ {result.get('message', 'Role created')}")
            if result.get("role"):
                print(f"   Role ID: {result.get('role', {}).get('id')}")

    def delete_role(self, role_id: int):
        """Delete a role"""
        result = self._request("DELETE", f"/admin/delete-role/{role_id}")
        if result:
            print(f"\n🗑️  {result.get('message', 'Role deleted')}")

    def update_role(self, role_id: int, name: Optional[str] = None, description: Optional[str] = None):
        """Update a role"""
        data = {}
        if name:
            data["name"] = name
        if description:
            data["description"] = description
        result = self._request("PUT", f"/admin/update-role/{role_id}", data)
        if result:
            print(f"\n✏️  {result.get('message', 'Role updated')}")

    def get_roles(self):
        """Get all roles"""
        result = self._request("GET", "/admin/get-roles")
        if result:
            roles = result.get("roles", [])
            print(f"\n🎭 Roles ({len(roles)} total):")
            print("-" * 60)
            for role in roles:
                print(f"  ID: {role.get('id')} | Name: {role.get('name')} | Description: {role.get('description', '')}")

    def assign_role(self, user_id: int, role_id: int):
        """Assign a role to a user"""
        data = {"userId": user_id, "roleId": role_id}
        result = self._request("POST", "/admin/assign-role", data)
        if result:
            print(f"\n✅ {result.get('message', 'Role assigned')}")

    # ==================== APPROVAL MANAGEMENT ====================
    def get_approvals(self):
        """Get all approvals"""
        result = self._request("GET", "/admin/get-approvals")
        if result:
            approvals = result.get("approvals", [])
            print(f"\n📋 Approvals ({len(approvals)} total):")
            print("-" * 80)
            for approval in approvals:
                print(f"  ID: {approval.get('id')} | User: {approval.get('userId')} | Command: {approval.get('command')} | Status: {approval.get('status')}")

    def create_approval(self, user_id: int, command: str):
        """Create a new approval request"""
        data = {"userId": user_id, "command": command}
        result = self._request("POST", "/admin/create-approval", data)
        if result:
            print(f"\n✅ {result.get('message', 'Approval created')}")
            if result.get("approval"):
                print(f"   Approval ID: {result.get('approval', {}).get('id')}")

    def update_approval(self, approval_id: int, status: str):
        """Update an approval status (APPROVED/REJECTED)"""
        data = {"status": status}
        result = self._request("PUT", f"/admin/update-approval/{approval_id}", data)
        if result:
            print(f"\n✏️  {result.get('message', 'Approval updated')}")

    def delete_approval(self, approval_id: int):
        """Delete an approval"""
        result = self._request("DELETE", f"/admin/delete-approval/{approval_id}")
        if result:
            print(f"\n🗑️  {result.get('message', 'Approval deleted')}")

    # ==================== COMMAND APPROVALS LIST ====================
    def get_command_approvals(self):
        """Get all command approval requests"""
        result = self._request("GET", "/admin/get-approvals-list")
        if result:
            approvals = result.get("approvalsList", [])
            print(f"\n📋 Command Approvals ({len(approvals)} total):")
            print("-" * 100)
            for approval in approvals:
                user = approval.get("user", {})
                print(f"  ID: {approval.get('id')} | User: {user.get('name', 'N/A')} ({user.get('mail', 'N/A')}) | Command: {approval.get('command')} | Status: {approval.get('status')}")

    def approve_command(self, approval_id: int, status: str):
        """Approve or reject a command (PENDING/APPROVED/REJECTED)"""
        data = {"status": status}
        result = self._request("PUT", f"/admin/update-approvals-list/{approval_id}", data)
        if result:
            print(f"\n✏️  {result.get('message', 'Command approval updated')}")

    def delete_command_approval(self, approval_id: int):
        """Delete a command approval request"""
        result = self._request("DELETE", f"/admin/delete-approvals-list/{approval_id}")
        if result:
            print(f"\n🗑️  {result.get('message', 'Command approval deleted')}")


def interactive_menu(cli: UnboundCLI):
    """Interactive menu for the CLI"""
    while True:
        print("\n" + "=" * 50)
        print("         🚀 UNBOUND CLI - Main Menu")
        print("=" * 50)
        print("\n  📌 USER COMMANDS:")
        print("    1. Execute Command")
        print("    2. View Credits")
        print("    3. View History")
        print("\n  🔧 ADMIN COMMANDS:")
        print("    4. Get Dashboard")
        print("    5. Create User")
        print("    6. Delete User")
        print("    7. Update User")
        print("    8. List Users")
        print("    9. Create Rule")
        print("   10. Delete Rule")
        print("   11. List Rules")
        print("   12. View Logs")
        print("\n  🎭 ROLE MANAGEMENT:")
        print("   13. Create Role")
        print("   14. Delete Role")
        print("   15. Update Role")
        print("   16. List Roles")
        print("   17. Assign Role to User")
        print("\n  📋 APPROVAL MANAGEMENT:")
        print("   18. List Approvals")
        print("   19. Create Approval")
        print("   20. Update Approval")
        print("   21. Delete Approval")
        print("\n  🔔 COMMAND APPROVALS LIST:")
        print("   22. List Pending Command Approvals")
        print("   23. Approve/Reject Command")
        print("   24. Delete Command Approval")
        print("\n    0. Exit")
        print("-" * 50)

        choice = input("\n  Enter choice: ").strip()

        if choice == "0":
            print("\n👋 Goodbye!")
            break
        elif choice == "1":
            command = input("  Enter command: ").strip()
            cli.execute_command(command)
        elif choice == "2":
            cli.get_credits()
        elif choice == "3":
            cli.get_history()
        elif choice == "4":
            cli.get_dashboard()
        elif choice == "5":
            mail = input("  Enter email: ").strip()
            name = input("  Enter name: ").strip()
            phone = input("  Enter phone: ").strip()
            user_type = input("  Enter user type (ADMIN/MEMBER): ").strip().upper()
            cli.create_user(mail, name, phone, user_type)
        elif choice == "6":
            user_id = int(input("  Enter user ID to delete: ").strip())
            cli.delete_user(user_id)
        elif choice == "7":
            user_id = int(input("  Enter user ID to update: ").strip())
            name = input("  Enter new name (leave empty to skip): ").strip() or None
            phone = input("  Enter new phone (leave empty to skip): ").strip() or None
            user_type = input("  Enter new user type (leave empty to skip): ").strip().upper() or None
            credits_str = input("  Enter new credits (leave empty to skip): ").strip()
            credits = int(credits_str) if credits_str else None
            cli.update_user(user_id, name, phone, user_type, credits)
        elif choice == "8":
            cli.get_users()
        elif choice == "9":
            pattern = input("  Enter regex pattern: ").strip()
            print("  Actions: AUTO_ACCEPT, AUTO_REJECT, REQUIRE_APPROVAL, TIMED_APPROVAL")
            action = input("  Enter action: ").strip().upper()
            cli.create_rule(pattern, action)
        elif choice == "10":
            rule_id = int(input("  Enter rule ID to delete: ").strip())
            cli.delete_rule(rule_id)
        elif choice == "11":
            cli.get_rules()
        elif choice == "12":
            cli.get_logs()
        # Role Management
        elif choice == "13":
            name = input("  Enter role name: ").strip()
            description = input("  Enter role description: ").strip()
            cli.create_role(name, description)
        elif choice == "14":
            role_id = int(input("  Enter role ID to delete: ").strip())
            cli.delete_role(role_id)
        elif choice == "15":
            role_id = int(input("  Enter role ID to update: ").strip())
            name = input("  Enter new name (leave empty to skip): ").strip() or None
            description = input("  Enter new description (leave empty to skip): ").strip() or None
            cli.update_role(role_id, name, description)
        elif choice == "16":
            cli.get_roles()
        elif choice == "17":
            user_id = int(input("  Enter user ID: ").strip())
            role_id = int(input("  Enter role ID to assign: ").strip())
            cli.assign_role(user_id, role_id)
        # Approval Management
        elif choice == "18":
            cli.get_approvals()
        elif choice == "19":
            user_id = int(input("  Enter user ID: ").strip())
            command = input("  Enter command: ").strip()
            cli.create_approval(user_id, command)
        elif choice == "20":
            approval_id = int(input("  Enter approval ID to update: ").strip())
            print("  Status options: APPROVED, REJECTED")
            status = input("  Enter new status: ").strip().upper()
            cli.update_approval(approval_id, status)
        elif choice == "21":
            approval_id = int(input("  Enter approval ID to delete: ").strip())
            cli.delete_approval(approval_id)
        # Command Approvals List
        elif choice == "22":
            cli.get_command_approvals()
        elif choice == "23":
            approval_id = int(input("  Enter command approval ID: ").strip())
            print("  Status options: PENDING, APPROVED, REJECTED")
            status = input("  Enter new status: ").strip().upper()
            cli.approve_command(approval_id, status)
        elif choice == "24":
            approval_id = int(input("  Enter command approval ID to delete: ").strip())
            cli.delete_command_approval(approval_id)
        else:
            print("  ❌ Invalid choice. Please try again.")

        input("\n  Press Enter to continue...")


def main():
    parser = argparse.ArgumentParser(
        description="Unbound CLI - Command Line Interface for Unbound API",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py --api-key YOUR_API_KEY
  python main.py -k YOUR_API_KEY

Commands available in interactive mode:
  - Execute commands
  - View credits & history
  - Manage users and rules (admin)
        """
    )
    parser.add_argument(
        "-k", "--api-key",
        required=True,
        help="Your API key for authentication"
    )
    parser.add_argument(
        "--base-url",
        default="http://localhost:3000",
        help="Base URL of the API (default: http://localhost:3000)"
    )

    args = parser.parse_args()

    global BASE_URL
    BASE_URL = args.base_url

    print("\n" + "=" * 50)
    print("    🔐 Connecting to Unbound API...")
    print("=" * 50)

    cli = UnboundCLI(args.api_key)

    # Test connection by getting credits or users
    interactive_menu(cli)


if __name__ == "__main__":
    main()
