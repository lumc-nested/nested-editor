// Prevent including the FA stylesheet to the document, we include it manually
// in the iframe.
var Icon = require('react-fa/dist/Icon');
var React = require('react');
var {Button, Modal} = require('react-bootstrap');


/**
 * TODO:
 * - Implement for pedigree/nest/pregnancy/member
 * - Open with bolt/config icon in fields sidebar or from table view button
 * - Show predefined and custom fields
 * - Drag to reorder (applies to all views)
 * - Tick for showing as annotation in layout view (only members)
 * - Tick for showing as column in table view (only members)
 * - Delete custom field
 * - Add custom field
 * - Rename custom field
 */


var FieldsEditor = React.createClass({
  render: function() {
    return (
      <Modal {...this.props} bsStyle="primary" title="Fields editor">
        <div className="modal-body">
          <table className="table">
            <thead>
              <tr>
                <th></th>
                <th>Field</th>
                <th>Value</th>
                <th><Icon name="sitemap" title="Show in layout view" /></th>
                <th><Icon name="table" title="Show in table view" /></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><Button bsStyle="link"><Icon name="times" /></Button></td>
                <td>Gender</td>
                <td>Male / Female</td>
                <td><input type="checkbox" checked="checked" /></td>
                <td><input type="checkbox" checked="checked" /></td>
              </tr>
              <tr>
                <td><Button bsStyle="link"><Icon name="times" /></Button></td>
                <td>Date of birth</td>
                <td>Date</td>
                <td><input type="checkbox" checked="checked" /></td>
                <td><input type="checkbox" /></td>
              </tr>
              <tr>
                <td><Button bsStyle="link"><Icon name="times" /></Button></td>
                <td>Date of death</td>
                <td>Date</td>
                <td><input type="checkbox" /></td>
                <td><input type="checkbox" /></td>
              </tr>
              <tr>
                <td><Button bsStyle="link"><Icon name="times" /></Button></td>
                <td>Proband</td>
                <td>Yes / No</td>
                <td><input type="checkbox" checked="checked" /></td>
                <td><input type="checkbox" /></td>
              </tr>
              <tr>
                <td><Button bsStyle="link"><Icon name="times" /></Button></td>
                <td>Comment</td>
                <td>Text</td>
                <td><input type="checkbox" checked="checked" /></td>
                <td><input type="checkbox" /></td>
              </tr>
              <tr>
                <td><Button bsStyle="link"><Icon name="times" /></Button></td>
                <td>Gender</td>
                <td>Male / Female</td>
                <td><input type="checkbox" checked="checked" /></td>
                <td><input type="checkbox" checked="checked" /></td>
              </tr>
              <tr>
                <td><Button bsStyle="link"><Icon name="times" /></Button></td>
                <td>Date of birth</td>
                <td>Date</td>
                <td><input type="checkbox" checked="checked" /></td>
                <td><input type="checkbox" /></td>
              </tr>
              <tr>
                <td><Button bsStyle="link"><Icon name="times" /></Button></td>
                <td>Date of death</td>
                <td>Date</td>
                <td><input type="checkbox" /></td>
                <td><input type="checkbox" /></td>
              </tr>
              <tr>
                <td><Button bsStyle="link"><Icon name="times" /></Button></td>
                <td>Proband</td>
                <td>Yes / No</td>
                <td><input type="checkbox" checked="checked" /></td>
                <td><input type="checkbox" /></td>
              </tr>
              <tr>
                <td><Button bsStyle="link"><Icon name="times" /></Button></td>
                <td>Comment</td>
                <td>Text</td>
                <td><input type="checkbox" checked="checked" /></td>
                <td><input type="checkbox" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="modal-footer">
          <Button onClick={this.props.onRequestHide}>Close</Button>
        </div>
      </Modal>
    );
  }
});


module.exports = FieldsEditor;
